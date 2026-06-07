const { v4: uuidv4 } = require('uuid');
const path = require('path');
const pool = require('../config/db');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');
const { success, error } = require('../utils/response');

// ─── POST /api/payments/:appointmentId/upload ─────────────────────────────────
// Patient uploads payment screenshot
const uploadScreenshot = async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    // Resolve patient
    const { rows: [patient] } = await pool.query(
      'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
    );
    if (!patient) return error(res, 'Patient profile not found.', 404);

    // Verify appointment belongs to this patient
    const { rows: [appt] } = await pool.query(
      'SELECT * FROM appointments WHERE id=$1 AND patient_id=$2',
      [appointmentId, patient.id]
    );
    if (!appt) return error(res, 'Appointment not found.', 404);

    if (!['pending', 'payment_uploaded'].includes(appt.status)) {
      return error(res, `Cannot upload payment for an appointment with status: ${appt.status}.`, 400);
    }

    if (!req.file) return error(res, 'Payment screenshot file is required.', 400);

    // Upload to Supabase Storage
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `payment_${uuidv4()}${ext}`;
    const screenshotUrl = await uploadToStorage(req.file.buffer, 'payments', filename, req.file.mimetype);

    // Get doctor consultation fee as payment amount
    const { rows: [doc] } = await pool.query(
      'SELECT consultation_fee FROM doctors WHERE id=$1', [appt.doctor_id]
    );

    // If a payment record already exists (re-upload), update it
    const { rows: [existing] } = await pool.query(
      'SELECT id, screenshot_path FROM payments WHERE appointment_id=$1', [appointmentId]
    );

    let payment;
    if (existing) {
      // Delete old file from storage
      const oldFilename = existing.screenshot_path?.split('/').pop()?.split('?')[0];
      if (oldFilename) await deleteFromStorage('payments', oldFilename);

      const { rows: [updated] } = await pool.query(
        `UPDATE payments
         SET screenshot_path=$1, status='pending', rejection_note=NULL
         WHERE appointment_id=$2 RETURNING *`,
        [screenshotUrl, appointmentId]
      );
      payment = updated;
    } else {
      const { rows: [created] } = await pool.query(
        `INSERT INTO payments (appointment_id, amount, screenshot_path, status)
         VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [appointmentId, doc.consultation_fee, screenshotUrl]
      );
      payment = created;
    }

    // Update appointment status
    await pool.query(
      `UPDATE appointments SET status='payment_uploaded', updated_at=NOW() WHERE id=$1`,
      [appointmentId]
    );

    return success(res, payment, 'Payment screenshot uploaded. Awaiting verification.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/payments ─────────────────────────────────────────────────────────
// Assistant sees their doctor's payments; admin sees all
const getPayments = async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    if (req.user.role === 'assistant') {
      const { rows: [asst] } = await pool.query(
        'SELECT doctor_id FROM assistants WHERE user_id=$1', [req.user.id]
      );
      if (!asst) return success(res, { payments: [], pagination: {} });
      params.push(asst.doctor_id);
      conditions.push(`a.doctor_id = $${params.length}`);
    }

    if (req.user.role === 'doctor') {
      const { rows: [doc] } = await pool.query(
        'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
      );
      if (!doc) return success(res, { payments: [], pagination: {} });
      params.push(doc.id);
      conditions.push(`a.doctor_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`pay.status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM payments pay
       JOIN appointments a ON a.id = pay.appointment_id
       ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT
         pay.*,
         a.appointment_date, a.appointment_time, a.status AS appointment_status,
         up.name  AS patient_name,  up.phone AS patient_phone,
         ud.name  AS doctor_name,
         c.name   AS clinic_name,
         uv.name  AS verified_by_name
       FROM payments pay
       JOIN appointments a  ON a.id   = pay.appointment_id
       JOIN patients     pt ON pt.id  = a.patient_id
       JOIN users        up ON up.id  = pt.user_id
       JOIN doctors      d  ON d.id   = a.doctor_id
       JOIN users        ud ON ud.id  = d.user_id
       JOIN clinics      c  ON c.id   = a.clinic_id
       LEFT JOIN users   uv ON uv.id  = pay.verified_by
       ${where}
       ORDER BY pay.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      payments: rows,
      pagination: {
        total: parseInt(count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(count) / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/payments/:id ─────────────────────────────────────────────────────
const getPaymentById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         pay.*,
         a.appointment_date, a.appointment_time, a.status AS appointment_status,
         up.name  AS patient_name,  up.email AS patient_email,
         ud.name  AS doctor_name,
         c.name   AS clinic_name,   c.city,
         uv.name  AS verified_by_name
       FROM payments pay
       JOIN appointments a  ON a.id  = pay.appointment_id
       JOIN patients     pt ON pt.id = a.patient_id
       JOIN users        up ON up.id = pt.user_id
       JOIN doctors      d  ON d.id  = a.doctor_id
       JOIN users        ud ON ud.id = d.user_id
       JOIN clinics      c  ON c.id  = a.clinic_id
       LEFT JOIN users   uv ON uv.id = pay.verified_by
       WHERE pay.id = $1`,
      [req.params.id]
    );

    if (!rows.length) return error(res, 'Payment not found.', 404);

    // Access control
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      const allowed = await canAccessPayment(req.user, rows[0]);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/payments/:id/verify ───────────────────────────────────────────
// Assistant or admin verifies payment → appointment becomes confirmed
const verifyPayment = async (req, res, next) => {
  try {
    const { rows: [payment] } = await pool.query(
      'SELECT * FROM payments WHERE id=$1', [req.params.id]
    );
    if (!payment) return error(res, 'Payment not found.', 404);

    if (payment.status === 'verified') {
      return error(res, 'Payment is already verified.', 400);
    }
    if (payment.status === 'rejected') {
      return error(res, 'Cannot verify a rejected payment. Patient must re-upload.', 400);
    }

    // Assistant access check
    if (req.user.role === 'assistant') {
      const allowed = await canAccessPayment(req.user, payment);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    await pool.query('BEGIN');

    const { rows: [updated] } = await pool.query(
      `UPDATE payments
       SET status='verified', verified_by=$1, verified_at=NOW(), rejection_note=NULL
       WHERE id=$2 RETURNING *`,
      [req.user.id, payment.id]
    );

    // Advance appointment to confirmed
    await pool.query(
      `UPDATE appointments
       SET status='confirmed', updated_at=NOW()
       WHERE id=$1`,
      [payment.appointment_id]
    );

    // Notify patient
    const { rows: [apptRow] } = await pool.query(
      `SELECT pt.user_id FROM appointments a JOIN patients pt ON pt.id=a.patient_id WHERE a.id=$1`,
      [payment.appointment_id]
    );
    if (apptRow) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)`,
        [apptRow.user_id, 'Payment Verified', 'Your payment has been verified. Your appointment is now confirmed.']
      ).catch(() => {});
    }

    await pool.query('COMMIT');

    return success(res, updated, 'Payment verified. Appointment is now confirmed.');
  } catch (err) {
    await pool.query('ROLLBACK');
    next(err);
  }
};

// ─── PATCH /api/payments/:id/reject ───────────────────────────────────────────
// Assistant or admin rejects payment → patient must re-upload
const rejectPayment = async (req, res, next) => {
  const { rejection_note } = req.body;

  try {
    const { rows: [payment] } = await pool.query(
      'SELECT * FROM payments WHERE id=$1', [req.params.id]
    );
    if (!payment) return error(res, 'Payment not found.', 404);

    if (payment.status === 'verified') {
      return error(res, 'Cannot reject an already verified payment.', 400);
    }

    if (req.user.role === 'assistant') {
      const allowed = await canAccessPayment(req.user, payment);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    const { rows: [updated] } = await pool.query(
      `UPDATE payments
       SET status='rejected', verified_by=$1, verified_at=NOW(), rejection_note=$2
       WHERE id=$3 RETURNING *`,
      [req.user.id, rejection_note || 'Payment could not be verified.', payment.id]
    );

    // Revert appointment to pending so patient can re-upload
    await pool.query(
      `UPDATE appointments SET status='pending', updated_at=NOW() WHERE id=$1`,
      [payment.appointment_id]
    );

    // Notify patient
    const { rows: [apptRow2] } = await pool.query(
      `SELECT pt.user_id FROM appointments a JOIN patients pt ON pt.id=a.patient_id WHERE a.id=$1`,
      [payment.appointment_id]
    );
    if (apptRow2) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)`,
        [apptRow2.user_id, 'Payment Rejected',
         `Your payment was rejected. Reason: ${rejection_note || 'Payment could not be verified.'}. Please re-upload.`]
      ).catch(() => {});
    }

    return success(res, updated, 'Payment rejected. Patient notified to re-upload.');
  } catch (err) {
    next(err);
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────
async function canAccessPayment(user, payment) {
  if (user.role === 'assistant') {
    const { rows } = await pool.query(
      `SELECT 1 FROM assistants ast
       JOIN appointments a ON a.doctor_id = ast.doctor_id
       WHERE ast.user_id=$1 AND a.id=$2`,
      [user.id, payment.appointment_id]
    );
    return rows.length > 0;
  }
  if (user.role === 'patient') {
    const { rows } = await pool.query(
      `SELECT 1 FROM patients pt
       JOIN appointments a ON a.patient_id = pt.id
       WHERE pt.user_id=$1 AND a.id=$2`,
      [user.id, payment.appointment_id]
    );
    return rows.length > 0;
  }
  if (user.role === 'doctor') {
    const { rows } = await pool.query(
      `SELECT 1 FROM doctors d
       JOIN appointments a ON a.doctor_id = d.id
       WHERE d.user_id=$1 AND a.id=$2`,
      [user.id, payment.appointment_id]
    );
    return rows.length > 0;
  }
  return false;
}

module.exports = {
  uploadScreenshot,
  getPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
};
