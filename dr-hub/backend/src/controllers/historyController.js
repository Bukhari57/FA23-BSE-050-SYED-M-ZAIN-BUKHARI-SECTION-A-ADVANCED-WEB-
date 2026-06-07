const pool = require('../config/db');
const { success, error } = require('../utils/response');

// ─── POST /api/history ─────────────────────────────────────────────────────────
// Doctor adds a medical history entry (must have a completed/confirmed appointment)
const addHistory = async (req, res, next) => {
  const { patient_id, appointment_id, diagnosis, notes } = req.body;

  try {
    // Resolve doctor
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    // Verify patient exists
    const { rows: [patient] } = await pool.query(
      'SELECT id FROM patients WHERE id=$1', [patient_id]
    );
    if (!patient) return error(res, 'Patient not found.', 404);

    // If appointment_id provided, verify it belongs to this doctor + patient
    if (appointment_id) {
      const { rows: [appt] } = await pool.query(
        `SELECT id, status FROM appointments
         WHERE id=$1 AND doctor_id=$2 AND patient_id=$3`,
        [appointment_id, doc.id, patient_id]
      );
      if (!appt) return error(res, 'Appointment not found or does not belong to you.', 404);
      if (!['confirmed', 'completed'].includes(appt.status)) {
        return error(res, 'Medical history can only be added for confirmed or completed appointments.', 400);
      }
    }

    const { rows: [history] } = await pool.query(
      `INSERT INTO medical_history (patient_id, doctor_id, appointment_id, diagnosis, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patient_id, doc.id, appointment_id || null, diagnosis, notes || null]
    );

    // Notify patient
    const { rows: [patUser] } = await pool.query(
      'SELECT user_id FROM patients WHERE id=$1', [patient_id]
    );
    if (patUser) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) VALUES ($1,$2,$3)`,
        [patUser.user_id, 'Medical Record Added',
         `Your doctor has added a new medical record: ${diagnosis}`]
      ).catch(() => {});
    }

    return success(res, history, 'Medical history record added.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/history ──────────────────────────────────────────────────────────
// Patient sees their own; doctor sees their patients'; admin sees all
const getHistory = async (req, res, next) => {
  const { patient_id, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    switch (req.user.role) {
      case 'patient': {
        const { rows: [p] } = await pool.query(
          'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
        );
        if (!p) return success(res, { history: [], pagination: {} });
        params.push(p.id);
        conditions.push(`mh.patient_id = $${params.length}`);
        break;
      }
      case 'doctor': {
        const { rows: [d] } = await pool.query(
          'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
        );
        if (!d) return success(res, { history: [], pagination: {} });
        params.push(d.id);
        conditions.push(`mh.doctor_id = $${params.length}`);

        // Doctor can optionally filter by a specific patient
        if (patient_id) {
          params.push(patient_id);
          conditions.push(`mh.patient_id = $${params.length}`);
        }
        break;
      }
      case 'admin':
      case 'super_admin':
        if (patient_id) {
          params.push(patient_id);
          conditions.push(`mh.patient_id = $${params.length}`);
        }
        break;
      default:
        return error(res, 'Access denied.', 403);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM medical_history mh ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT
         mh.*,
         up.name  AS patient_name,
         ud.name  AS doctor_name,  d.specialization,
         a.appointment_date, a.appointment_time,
         COALESCE(
           json_agg(
             jsonb_build_object(
               'id', rx.id,
               'medicines', rx.medicines,
               'instructions', rx.instructions,
               'created_at', rx.created_at
             )
           ) FILTER (WHERE rx.id IS NOT NULL),
           '[]'
         ) AS prescriptions
       FROM medical_history mh
       JOIN patients  pt ON pt.id  = mh.patient_id
       JOIN users     up ON up.id  = pt.user_id
       JOIN doctors   d  ON d.id   = mh.doctor_id
       JOIN users     ud ON ud.id  = d.user_id
       LEFT JOIN appointments   a  ON a.id   = mh.appointment_id
       LEFT JOIN prescriptions rx  ON rx.medical_history_id = mh.id
       ${where}
       GROUP BY mh.id, up.name, ud.name, d.specialization, a.appointment_date, a.appointment_time
       ORDER BY mh.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      history: rows,
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

// ─── GET /api/history/:id ──────────────────────────────────────────────────────
const getHistoryById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         mh.*,
         up.name  AS patient_name,  up.email AS patient_email,
         ud.name  AS doctor_name,   d.specialization, d.treatment_type,
         a.appointment_date, a.appointment_time,
         COALESCE(
           json_agg(
             jsonb_build_object(
               'id',           rx.id,
               'medicines',    rx.medicines,
               'instructions', rx.instructions,
               'created_at',   rx.created_at
             )
           ) FILTER (WHERE rx.id IS NOT NULL),
           '[]'
         ) AS prescriptions
       FROM medical_history mh
       JOIN patients  pt ON pt.id  = mh.patient_id
       JOIN users     up ON up.id  = pt.user_id
       JOIN doctors   d  ON d.id   = mh.doctor_id
       JOIN users     ud ON ud.id  = d.user_id
       LEFT JOIN appointments   a  ON a.id   = mh.appointment_id
       LEFT JOIN prescriptions rx  ON rx.medical_history_id = mh.id
       WHERE mh.id = $1
       GROUP BY mh.id, up.name, up.email, ud.name, d.specialization, d.treatment_type,
                a.appointment_date, a.appointment_time`,
      [req.params.id]
    );

    if (!rows.length) return error(res, 'Medical history record not found.', 404);

    const record = rows[0];

    // Access control
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      const allowed = await canAccessHistory(req.user, record);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    return success(res, record);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/history/:historyId/prescriptions ────────────────────────────────
// Doctor adds a prescription to an existing history record
const addPrescription = async (req, res, next) => {
  const { historyId } = req.params;
  const { medicines, instructions } = req.body;

  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    // Verify history record belongs to this doctor
    const { rows: [history] } = await pool.query(
      'SELECT * FROM medical_history WHERE id=$1 AND doctor_id=$2',
      [historyId, doc.id]
    );
    if (!history) return error(res, 'Medical history record not found or access denied.', 404);

    // Validate medicines array
    if (!Array.isArray(medicines) || !medicines.length) {
      return error(res, 'medicines must be a non-empty array.', 400);
    }

    for (const med of medicines) {
      if (!med.name) return error(res, 'Each medicine must have a name.', 400);
    }

    const { rows: [prescription] } = await pool.query(
      `INSERT INTO prescriptions
         (medical_history_id, doctor_id, patient_id, medicines, instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [historyId, doc.id, history.patient_id, JSON.stringify(medicines), instructions || null]
    );

    return success(res, prescription, 'Prescription added.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/history/:historyId/prescriptions ────────────────────────────────
const getPrescriptions = async (req, res, next) => {
  const { historyId } = req.params;

  try {
    // Fetch history first for access check
    const { rows: [history] } = await pool.query(
      'SELECT * FROM medical_history WHERE id=$1', [historyId]
    );
    if (!history) return error(res, 'Medical history record not found.', 404);

    if (!['admin', 'super_admin'].includes(req.user.role)) {
      const allowed = await canAccessHistory(req.user, history);
      if (!allowed) return error(res, 'Access denied.', 403);
    }

    const { rows } = await pool.query(
      `SELECT rx.*, ud.name AS doctor_name
       FROM prescriptions rx
       JOIN doctors d ON d.id = rx.doctor_id
       JOIN users  ud ON ud.id = d.user_id
       WHERE rx.medical_history_id = $1
       ORDER BY rx.created_at ASC`,
      [historyId]
    );

    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// ─── Helper ───────────────────────────────────────────────────────────────────
async function canAccessHistory(user, record) {
  if (user.role === 'patient') {
    const { rows } = await pool.query(
      'SELECT id FROM patients WHERE user_id=$1', [user.id]
    );
    return rows.length && rows[0].id === record.patient_id;
  }
  if (user.role === 'doctor') {
    const { rows } = await pool.query(
      'SELECT id FROM doctors WHERE user_id=$1', [user.id]
    );
    return rows.length && rows[0].id === record.doctor_id;
  }
  return false;
}

module.exports = {
  addHistory,
  getHistory,
  getHistoryById,
  addPrescription,
  getPrescriptions,
};
