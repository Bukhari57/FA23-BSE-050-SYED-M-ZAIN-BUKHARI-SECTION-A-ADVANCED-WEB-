const pool = require('../config/db');
const { success, error } = require('../utils/response');

// ─── POST /api/appointments ───────────────────────────────────────────────────
// Patient books an appointment
const bookAppointment = async (req, res, next) => {
  const { doctor_id, clinic_id, appointment_date, appointment_time, patient_notes } = req.body;

  try {
    // Resolve patient profile
    const { rows: [patient] } = await pool.query(
      'SELECT id FROM patients WHERE user_id = $1',
      [req.user.id]
    );
    if (!patient) return error(res, 'Patient profile not found.', 404);

    // Verify doctor exists and is verified
    const { rows: [doctor] } = await pool.query(
      'SELECT id, consultation_fee FROM doctors WHERE id = $1 AND is_verified = true',
      [doctor_id]
    );
    if (!doctor) return error(res, 'Doctor not found or not verified.', 404);

    // Verify clinic is linked to doctor
    const { rows: linked } = await pool.query(
      'SELECT 1 FROM doctor_clinics WHERE doctor_id=$1 AND clinic_id=$2',
      [doctor_id, clinic_id]
    );
    if (!linked.length) return error(res, 'This clinic is not associated with the selected doctor.', 400);

    // Verify requested slot is in the doctor's schedule
    const dayName = new Date(`${appointment_date}T12:00:00`)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const { rows: schedule } = await pool.query(
      `SELECT * FROM doctor_schedules
       WHERE doctor_id=$1 AND clinic_id=$2 AND day=$3 AND is_available=true
       AND start_time <= $4::time AND end_time > $4::time`,
      [doctor_id, clinic_id, dayName, appointment_time]
    );
    if (!schedule.length) return error(res, 'The selected time slot is not available.', 400);

    // Check slot not already booked
    const { rows: conflict } = await pool.query(
      `SELECT id FROM appointments
       WHERE doctor_id=$1 AND appointment_date=$2 AND appointment_time=$3
       AND status NOT IN ('cancelled')`,
      [doctor_id, appointment_date, appointment_time]
    );
    if (conflict.length) return error(res, 'This time slot is already booked.', 409);

    // Create appointment
    const { rows: [appt] } = await pool.query(
      `INSERT INTO appointments
         (patient_id, doctor_id, clinic_id, appointment_date, appointment_time, patient_notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING *`,
      [patient.id, doctor_id, clinic_id, appointment_date, appointment_time, patient_notes || null]
    );

    // Notify doctor
    const { rows: [docUser] } = await pool.query(
      'SELECT user_id FROM doctors WHERE id=$1', [doctor_id]
    );
    if (docUser) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)`,
        [docUser.user_id, 'New Appointment Booked',
         `A patient has booked an appointment on ${appointment_date} at ${appointment_time}.`]
      ).catch(() => {});
    }

    return success(res, appt, 'Appointment booked. Please upload payment screenshot.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/appointments ─────────────────────────────────────────────────────
// Role-aware listing
const getAppointments = async (req, res, next) => {
  const { status, date, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    switch (req.user.role) {
      case 'patient': {
        const { rows: [p] } = await pool.query(
          'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
        );
        if (!p) return success(res, { appointments: [], pagination: {} });
        params.push(p.id);
        conditions.push(`a.patient_id = $${params.length}`);
        break;
      }
      case 'doctor': {
        const { rows: [d] } = await pool.query(
          'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
        );
        if (!d) return success(res, { appointments: [], pagination: {} });
        params.push(d.id);
        conditions.push(`a.doctor_id = $${params.length}`);
        break;
      }
      case 'assistant': {
        // Assistant sees appointments for their assigned doctor
        const { rows: [asst] } = await pool.query(
          'SELECT doctor_id FROM assistants WHERE user_id=$1', [req.user.id]
        );
        if (!asst) return success(res, { appointments: [], pagination: {} });
        params.push(asst.doctor_id);
        conditions.push(`a.doctor_id = $${params.length}`);
        break;
      }
      // admin + super_admin see all — no filter
    }

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (date) {
      params.push(date);
      conditions.push(`a.appointment_date = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM appointments a ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT
         a.*,
         up.name   AS patient_name, up.phone AS patient_phone,
         ud.name   AS doctor_name,  ud.phone AS doctor_phone,
         d.specialization, d.treatment_type, d.consultation_fee,
         d.profile_picture_url,
         d.bank_name, d.account_title, d.bank_account_number,
         d.jazzcash_number, d.easypaisa_number, d.qr_code_url,
         c.name    AS clinic_name,  c.address AS clinic_address,
         pay.id    AS payment_id,   pay.status AS payment_status,
         pay.screenshot_path
       FROM appointments a
       JOIN patients pt ON pt.id = a.patient_id
       JOIN users   up ON up.id = pt.user_id
       JOIN doctors d  ON d.id  = a.doctor_id
       JOIN users   ud ON ud.id = d.user_id
       JOIN clinics c  ON c.id  = a.clinic_id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       ${where}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      appointments: rows,
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

// ─── GET /api/appointments/:id ─────────────────────────────────────────────────
const getAppointmentById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.*,
         up.name   AS patient_name, up.email AS patient_email, up.phone AS patient_phone,
         ud.name   AS doctor_name,  ud.email AS doctor_email,  ud.phone AS doctor_phone,
         d.specialization, d.treatment_type, d.consultation_fee,
         c.name    AS clinic_name,  c.address AS clinic_address, c.city,
         pay.id    AS payment_id,   pay.status AS payment_status,
         pay.amount, pay.screenshot_path, pay.verified_at
       FROM appointments a
       JOIN patients pt ON pt.id = a.patient_id
       JOIN users   up ON up.id = pt.user_id
       JOIN doctors d  ON d.id  = a.doctor_id
       JOIN users   ud ON ud.id = d.user_id
       JOIN clinics c  ON c.id  = a.clinic_id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (!rows.length) return error(res, 'Appointment not found.', 404);

    const appt = rows[0];

    // Access control: only the involved patient, doctor, their assistant, or admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      const allowed = await canAccessAppointment(req.user, appt);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    return success(res, appt);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/appointments/:id/cancel ───────────────────────────────────────
const cancelAppointment = async (req, res, next) => {
  try {
    const { rows: [appt] } = await pool.query(
      'SELECT * FROM appointments WHERE id=$1', [req.params.id]
    );
    if (!appt) return error(res, 'Appointment not found.', 404);

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      const allowed = await canAccessAppointment(req.user, appt);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    if (['completed', 'cancelled'].includes(appt.status)) {
      return error(res, `Cannot cancel an appointment that is already ${appt.status}.`, 400);
    }

    const { rows: [updated] } = await pool.query(
      `UPDATE appointments SET status='cancelled', updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );

    return success(res, updated, 'Appointment cancelled.');
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/appointments/:id/complete ─────────────────────────────────────
// Doctor marks appointment as completed
const completeAppointment = async (req, res, next) => {
  try {
    const { rows: [appt] } = await pool.query(
      'SELECT * FROM appointments WHERE id=$1', [req.params.id]
    );
    if (!appt) return error(res, 'Appointment not found.', 404);

    // Only the assigned doctor
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
    );
    if (!doc || doc.id !== appt.doctor_id) {
      return error(res, 'Access denied.', 403);
    }

    if (appt.status !== 'confirmed') {
      return error(res, 'Only confirmed appointments can be marked as completed.', 400);
    }

    const { rows: [updated] } = await pool.query(
      `UPDATE appointments SET status='completed', updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );

    return success(res, updated, 'Appointment marked as completed.');
  } catch (err) {
    next(err);
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────
async function canAccessAppointment(user, appt) {
  if (user.role === 'patient') {
    const { rows } = await pool.query(
      'SELECT id FROM patients WHERE user_id=$1', [user.id]
    );
    return rows.length && rows[0].id === appt.patient_id;
  }
  if (user.role === 'doctor') {
    const { rows } = await pool.query(
      'SELECT id FROM doctors WHERE user_id=$1', [user.id]
    );
    return rows.length && rows[0].id === appt.doctor_id;
  }
  if (user.role === 'assistant') {
    const { rows } = await pool.query(
      'SELECT doctor_id FROM assistants WHERE user_id=$1', [user.id]
    );
    return rows.length && rows[0].doctor_id === appt.doctor_id;
  }
  return false;
}

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
};
