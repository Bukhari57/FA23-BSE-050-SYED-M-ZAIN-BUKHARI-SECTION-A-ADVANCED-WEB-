const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { success, error } = require('../utils/response');

// ─── USERS ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  const { role, search, is_active, page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    if (role) {
      params.push(role);
      conditions.push(`u.role = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`
      );
    }
    if (is_active !== undefined) {
      params.push(is_active === 'true');
      conditions.push(`u.is_active = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM users u ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
         d.id AS doctor_id, d.specialization, d.treatment_type, d.is_verified,
         ast.doctor_id AS assigned_doctor_id,
         aud.name AS assigned_doctor_name,
         p.id AS patient_id
       FROM users u
       LEFT JOIN doctors  d ON d.user_id = u.id
       LEFT JOIN assistants ast ON ast.user_id = u.id
       LEFT JOIN doctors ad ON ad.id = ast.doctor_id
       LEFT JOIN users aud ON aud.id = ad.user_id
       LEFT JOIN patients p ON p.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      users: rows,
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

// GET /api/admin/users/:id
const getUserById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
         d.id AS doctor_id, d.specialization, d.treatment_type,
         d.experience_years, d.qualification, d.consultation_fee, d.is_verified,
         ast.doctor_id AS assigned_doctor_id,
         aud.name AS assigned_doctor_name,
         p.id AS patient_id, p.date_of_birth, p.gender, p.blood_group, p.address
       FROM users u
       LEFT JOIN doctors  d ON d.user_id = u.id
       LEFT JOIN assistants ast ON ast.user_id = u.id
       LEFT JOIN doctors ad ON ad.id = ast.doctor_id
       LEFT JOIN users aud ON aud.id = ad.user_id
       LEFT JOIN patients p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'User not found.', 404);
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users  — admin creates doctor/assistant; super_admin creates any role
const createUser = async (req, res, next) => {
  const { name, email, password, phone, role,
          specialization, treatment_type, consultation_fee, qualification, doctor_id } = req.body;

  // Admin cannot create admin or super_admin accounts
  if (req.user.role === 'admin' && ['admin', 'super_admin'].includes(role)) {
    return error(res, 'Admins cannot create admin or super_admin accounts.', 403);
  }

  if (role === 'doctor' && (!specialization || !treatment_type)) {
    return error(res, 'Specialization and treatment type are required for doctor accounts.', 400);
  }

  if (role === 'assistant' && !doctor_id) {
    return error(res, 'Select the doctor this assistant will manage.', 400);
  }

  try {
    if (role === 'assistant') {
      const { rows: [doctor] } = await pool.query(
        'SELECT id FROM doctors WHERE id=$1',
        [doctor_id]
      );
      if (!doctor) return error(res, 'Selected doctor not found.', 404);
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email=$1', [email.toLowerCase()]
    );
    if (existing.length) return error(res, 'Email already registered.', 409);

    const hashed = await bcrypt.hash(password, 10);

    const { rows: [user] } = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email.toLowerCase(), hashed, phone || null, role]
    );

    // Auto-create associated profile
    if (role === 'patient') {
      await pool.query('INSERT INTO patients (user_id) VALUES ($1)', [user.id]);
    } else if (role === 'doctor') {
      await pool.query(
        `INSERT INTO doctors (user_id, specialization, treatment_type, consultation_fee, qualification)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, specialization, treatment_type, parseFloat(consultation_fee) || 0, qualification || null]
      );
    } else if (role === 'assistant') {
      await pool.query(
        `INSERT INTO assistants (user_id, doctor_id)
         VALUES ($1, $2)`,
        [user.id, doctor_id]
      );
    }

    return success(res, user, 'User created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/assistants/:id/doctor — link/reassign assistant to doctor
const assignAssistantDoctor = async (req, res, next) => {
  const { doctor_id } = req.body;

  try {
    const { rows: [assistant] } = await pool.query(
      `SELECT id, role FROM users WHERE id=$1`,
      [req.params.id]
    );
    if (!assistant) return error(res, 'Assistant user not found.', 404);
    if (assistant.role !== 'assistant') {
      return error(res, 'Only assistant accounts can be linked to a doctor.', 400);
    }

    const { rows: [doctor] } = await pool.query(
      `SELECT d.id, u.name
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       WHERE d.id=$1`,
      [doctor_id]
    );
    if (!doctor) return error(res, 'Selected doctor not found.', 404);

    const { rows: [assignment] } = await pool.query(
      `INSERT INTO assistants (user_id, doctor_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET doctor_id = EXCLUDED.doctor_id
       RETURNING *`,
      [assistant.id, doctor.id]
    );

    return success(res, {
      ...assignment,
      doctor_name: doctor.name,
    }, `Assistant linked to ${doctor.name}.`);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/toggle  — activate / deactivate
const toggleUserStatus = async (req, res, next) => {
  try {
    const { rows: [target] } = await pool.query(
      'SELECT id, role, is_active FROM users WHERE id=$1', [req.params.id]
    );
    if (!target) return error(res, 'User not found.', 404);

    // Prevent deactivating super_admin unless requester is also super_admin
    if (target.role === 'super_admin' && req.user.role !== 'super_admin') {
      return error(res, 'Only a super admin can deactivate another super admin.', 403);
    }

    // Prevent self-deactivation
    if (target.id === req.user.id) {
      return error(res, 'You cannot deactivate your own account.', 400);
    }

    const { rows: [updated] } = await pool.query(
      `UPDATE users SET is_active = NOT is_active, updated_at=NOW()
       WHERE id=$1 RETURNING id, name, email, role, is_active`,
      [req.params.id]
    );

    const action = updated.is_active ? 'activated' : 'deactivated';
    return success(res, updated, `User account ${action}.`);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  — super_admin only
const deleteUser = async (req, res, next) => {
  try {
    const { rows: [target] } = await pool.query(
      'SELECT id, role FROM users WHERE id=$1', [req.params.id]
    );
    if (!target) return error(res, 'User not found.', 404);

    if (target.id === req.user.id) {
      return error(res, 'You cannot delete your own account.', 400);
    }
    if (target.role === 'super_admin') {
      return error(res, 'Super admin accounts cannot be deleted.', 403);
    }

    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    return success(res, null, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

// ─── DOCTOR VERIFICATION ──────────────────────────────────────────────────────

// GET /api/admin/doctors/pending
const getPendingDoctors = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.created_at AS registered_at,
         d.id AS doctor_id, d.specialization, d.treatment_type,
         d.qualification, d.consultation_fee, d.is_verified
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.role = 'doctor' AND (d.is_verified = false OR d.id IS NULL)
       ORDER BY u.created_at ASC`
    );
    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/doctors/:id/verify
const verifyDoctor = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE doctors SET is_verified=true, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'Doctor not found.', 404);
    return success(res, rows[0], 'Doctor verified successfully.');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/doctors/:id/unverify
const unverifyDoctor = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE doctors SET is_verified=false, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'Doctor not found.', 404);
    return success(res, rows[0], 'Doctor verification revoked.');
  } catch (err) {
    next(err);
  }
};

// ─── CLINICS ──────────────────────────────────────────────────────────────────

// GET /api/admin/clinics
const getClinics = async (req, res, next) => {
  const { city, search, page = 1, limit = 15 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    if (city) {
      params.push(`%${city}%`);
      conditions.push(`c.city ILIKE $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.name ILIKE $${params.length} OR c.address ILIKE $${params.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM clinics c ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT c.*,
         COUNT(DISTINCT dc.doctor_id) AS doctor_count
       FROM clinics c
       LEFT JOIN doctor_clinics dc ON dc.clinic_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      clinics: rows,
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

// DELETE /api/admin/clinics/:id  — super_admin only
const deleteClinic = async (req, res, next) => {
  try {
    const { rows: [clinic] } = await pool.query(
      'SELECT id FROM clinics WHERE id=$1', [req.params.id]
    );
    if (!clinic) return error(res, 'Clinic not found.', 404);

    // Check no active appointments reference this clinic
    const { rows: active } = await pool.query(
      `SELECT id FROM appointments WHERE clinic_id=$1
       AND status NOT IN ('cancelled','completed')`,
      [req.params.id]
    );
    if (active.length) {
      return error(res, 'Cannot delete clinic with active appointments.', 400);
    }

    await pool.query('DELETE FROM clinics WHERE id=$1', [req.params.id]);
    return success(res, null, 'Clinic deleted.');
  } catch (err) {
    next(err);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const queries = [
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE role='patient')   AS patients,
        COUNT(*) FILTER (WHERE role='doctor')    AS doctors,
        COUNT(*) FILTER (WHERE role='assistant') AS assistants,
        COUNT(*) FILTER (WHERE role='admin')     AS admins,
        COUNT(*) FILTER (WHERE is_active=false)  AS inactive_users,
        COUNT(*)                                 AS total_users
        FROM users`),

      pool.query(`SELECT
        COUNT(*) FILTER (WHERE is_verified=false) AS pending_verification,
        COUNT(*) FILTER (WHERE is_verified=true)  AS verified,
        COUNT(*)                                  AS total
        FROM doctors`),

      pool.query(`SELECT
        COUNT(*) FILTER (WHERE status='pending')           AS pending,
        COUNT(*) FILTER (WHERE status='payment_uploaded')  AS payment_uploaded,
        COUNT(*) FILTER (WHERE status='confirmed')         AS confirmed,
        COUNT(*) FILTER (WHERE status='completed')         AS completed,
        COUNT(*) FILTER (WHERE status='cancelled')         AS cancelled,
        COUNT(*)                                           AS total
        FROM appointments`),

      pool.query(`SELECT
        COUNT(*) FILTER (WHERE status='pending')  AS pending,
        COUNT(*) FILTER (WHERE status='verified') AS verified,
        COUNT(*) FILTER (WHERE status='rejected') AS rejected,
        COALESCE(SUM(amount) FILTER (WHERE status='verified'), 0) AS total_revenue
        FROM payments`),

      pool.query('SELECT COUNT(*) AS total FROM clinics'),
      pool.query('SELECT COUNT(*) AS total FROM medical_history'),

      // Monthly appointment trend (last 6 months)
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', appointment_date), 'Mon YY') AS month,
          DATE_TRUNC('month', appointment_date) AS month_date,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed
        FROM appointments
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', appointment_date)
        ORDER BY DATE_TRUNC('month', appointment_date)
      `),

      // Monthly revenue trend (last 6 months)
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
          DATE_TRUNC('month', created_at) AS month_date,
          COALESCE(SUM(amount) FILTER (WHERE status='verified'), 0) AS revenue,
          COUNT(*) FILTER (WHERE status='verified') AS paid_count
        FROM payments
        WHERE created_at >= CURRENT_DATE - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
    ];

    const [users, doctors, appointments, payments, clinics, history, monthlyAppts, monthlyRevenue] =
      await Promise.all(queries);

    // Merge monthly appointment + revenue into combined chart data
    const monthMap = {};
    for (const row of monthlyAppts.rows) {
      monthMap[row.month] = { month: row.month, appointments: parseInt(row.total), completed: parseInt(row.completed), revenue: 0 };
    }
    for (const row of monthlyRevenue.rows) {
      if (monthMap[row.month]) {
        monthMap[row.month].revenue = parseFloat(row.revenue);
      } else {
        monthMap[row.month] = { month: row.month, appointments: 0, completed: 0, revenue: parseFloat(row.revenue) };
      }
    }
    const monthly_stats = Object.values(monthMap);

    return success(res, {
      users: users.rows[0],
      doctors: doctors.rows[0],
      appointments: appointments.rows[0],
      payments: payments.rows[0],
      clinics: clinics.rows[0],
      medical_history: history.rows[0],
      monthly_stats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers, getUserById, createUser, toggleUserStatus, deleteUser,
  assignAssistantDoctor,
  getPendingDoctors, verifyDoctor, unverifyDoctor,
  getClinics, deleteClinic,
  getStats,
};
