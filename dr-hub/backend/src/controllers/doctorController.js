const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');
const { success, error } = require('../utils/response');

// ─── GET /api/doctors ─────────────────────────────────────────────────────────
// Filters: treatment_type, specialization, disease, city, search, page, limit
const getDoctors = async (req, res, next) => {
  try {
    const {
      treatment_type,
      specialization,
      disease,
      city,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = ['d.is_verified = true', 'u.is_active = true'];

    if (treatment_type) {
      params.push(treatment_type);
      conditions.push(`d.treatment_type = $${params.length}`);
    }

    if (specialization) {
      params.push(`%${specialization}%`);
      conditions.push(`d.specialization ILIKE $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(u.name ILIKE $${params.length} OR d.specialization ILIKE $${params.length} OR d.bio ILIKE $${params.length})`
      );
    }

    if (city) {
      params.push(`%${city}%`);
      conditions.push(
        `d.id IN (SELECT dc.doctor_id FROM doctor_clinics dc JOIN clinics c ON c.id = dc.clinic_id WHERE c.city ILIKE $${params.length})`
      );
    }

    if (disease) {
      params.push(`%${disease}%`);
      conditions.push(
        `d.id IN (SELECT doctor_id FROM doctor_diseases WHERE disease_name ILIKE $${params.length})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) FROM doctors d
      JOIN users u ON u.id = d.user_id
      ${where}
    `;
    const { rows: countRows } = await pool.query(countQuery, params);
    const total = parseInt(countRows[0].count);

    params.push(parseInt(limit));
    params.push(offset);

    const dataQuery = `
      SELECT
        d.id, d.specialization, d.treatment_type, d.experience_years,
        d.qualification, d.consultation_fee, d.bio, d.profile_picture_url,
        u.name,
        COALESCE(
          json_agg(DISTINCT dd.disease_name) FILTER (WHERE dd.disease_name IS NOT NULL),
          '[]'
        ) AS diseases,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city))
          FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS clinics
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN doctor_diseases dd ON dd.doctor_id = d.id
      LEFT JOIN doctor_clinics dc ON dc.doctor_id = d.id
      LEFT JOIN clinics c ON c.id = dc.clinic_id
      ${where}
      GROUP BY d.id, u.name
      ORDER BY d.experience_years DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await pool.query(dataQuery, params);

    return success(res, {
      doctors: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/doctors/:id ─────────────────────────────────────────────────────
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT
        d.id, d.specialization, d.treatment_type, d.experience_years,
        d.qualification, d.consultation_fee, d.bio, d.is_verified,
        u.name,
        COALESCE(
          json_agg(DISTINCT dd.disease_name) FILTER (WHERE dd.disease_name IS NOT NULL),
          '[]'
        ) AS diseases,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', c.id, 'name', c.name, 'address', c.address, 'city', c.city, 'phone', c.phone
          )) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS clinics,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', ds.id, 'clinic_id', ds.clinic_id, 'day', ds.day,
            'start_time', ds.start_time, 'end_time', ds.end_time,
            'slot_duration_mins', ds.slot_duration_mins, 'is_available', ds.is_available
          )) FILTER (WHERE ds.id IS NOT NULL),
          '[]'
        ) AS schedules
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN doctor_diseases dd ON dd.doctor_id = d.id
      LEFT JOIN doctor_clinics dc ON dc.doctor_id = d.id
      LEFT JOIN clinics c ON c.id = dc.clinic_id
      LEFT JOIN doctor_schedules ds ON ds.doctor_id = d.id
      WHERE d.id = $1
      GROUP BY d.id, u.name`,
      [id]
    );

    if (!rows.length) return error(res, 'Doctor not found.', 404);
    // Do not expose contact details (email/phone) on the public endpoint.
    // If the requester is authenticated and has appropriate privileges,
    // they can retrieve contact info via the protected `profile/me` endpoint.
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/doctors/profile/me  (doctor sees their own full profile) ─────────
const getMyProfile = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         d.id, d.user_id, d.specialization, d.treatment_type, d.experience_years,
         d.qualification, d.consultation_fee, d.bio, d.is_verified, d.created_at,
         d.profile_picture_url, d.hospital_name, d.hospital_address,
         d.bank_name, d.account_title, d.bank_account_number,
         d.jazzcash_number, d.easypaisa_number, d.qr_code_url,
         u.name, u.email, u.phone,
         COALESCE(
           json_agg(DISTINCT jsonb_build_object(
             'id', c.id, 'name', c.name, 'address', c.address, 'city', c.city, 'phone', c.phone
           )) FILTER (WHERE c.id IS NOT NULL), '[]'
         ) AS clinics,
         COALESCE(
           json_agg(DISTINCT jsonb_build_object(
             'id', ds.id, 'clinic_id', ds.clinic_id, 'clinic_name', c2.name,
             'day', ds.day, 'start_time', ds.start_time, 'end_time', ds.end_time,
             'slot_duration_mins', ds.slot_duration_mins, 'is_available', ds.is_available
           )) FILTER (WHERE ds.id IS NOT NULL), '[]'
         ) AS schedules
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN doctor_clinics dc ON dc.doctor_id = d.id
       LEFT JOIN clinics c ON c.id = dc.clinic_id
       LEFT JOIN doctor_schedules ds ON ds.doctor_id = d.id
       LEFT JOIN clinics c2 ON c2.id = ds.clinic_id
       WHERE d.user_id = $1
       GROUP BY d.id, u.name, u.email, u.phone`,
      [req.user.id]
    );
    if (!rows.length) return error(res, 'Doctor profile not found.', 404);
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/doctors/profile ─────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  const {
    specialization, treatment_type, experience_years,
    qualification, consultation_fee, bio,
    hospital_name, hospital_address,
  } = req.body;

  try {
    const { rows: existing } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );

    if (!existing.length) {
      const { rows } = await pool.query(
        `INSERT INTO doctors
           (user_id, specialization, treatment_type, experience_years, qualification,
            consultation_fee, bio, hospital_name, hospital_address)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [req.user.id, specialization, treatment_type, experience_years || 0,
         qualification || null, consultation_fee || 0, bio || null,
         hospital_name || null, hospital_address || null]
      );
      return success(res, rows[0], 'Doctor profile created.', 201);
    }

    const { rows } = await pool.query(
      `UPDATE doctors SET
         specialization     = COALESCE($1, specialization),
         treatment_type     = COALESCE($2::treatment_type, treatment_type),
         experience_years   = COALESCE($3, experience_years),
         qualification      = COALESCE($4, qualification),
         consultation_fee   = COALESCE($5, consultation_fee),
         bio                = COALESCE($6, bio),
         hospital_name      = COALESCE($7, hospital_name),
         hospital_address   = COALESCE($8, hospital_address),
         updated_at         = NOW()
       WHERE user_id = $9
       RETURNING *`,
      [specialization, treatment_type, experience_years, qualification,
       consultation_fee, bio, hospital_name, hospital_address, req.user.id]
    );

    return success(res, rows[0], 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/doctors/payment-info ────────────────────────────────────────────
const updatePaymentInfo = async (req, res, next) => {
  const { bank_name, account_title, bank_account_number, jazzcash_number, easypaisa_number } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE doctors SET
         bank_name            = COALESCE($1, bank_name),
         account_title        = COALESCE($2, account_title),
         bank_account_number  = COALESCE($3, bank_account_number),
         jazzcash_number      = COALESCE($4, jazzcash_number),
         easypaisa_number     = COALESCE($5, easypaisa_number),
         updated_at           = NOW()
       WHERE user_id = $6
       RETURNING bank_name, account_title, bank_account_number, jazzcash_number, easypaisa_number`,
      [bank_name || null, account_title || null, bank_account_number || null,
       jazzcash_number || null, easypaisa_number || null, req.user.id]
    );
    if (!rows.length) return error(res, 'Doctor profile not found.', 404);
    return success(res, rows[0], 'Payment info updated.');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/doctors/profile-picture ────────────────────────────────────────
const uploadProfilePicture = async (req, res, next) => {
  if (!req.file) return error(res, 'No file uploaded.', 400);
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `profile_${uuidv4()}${ext}`;
    const url = await uploadToStorage(req.file.buffer, 'reports', filename, req.file.mimetype);

    const { rows } = await pool.query(
      `UPDATE doctors SET profile_picture_url=$1, updated_at=NOW()
       WHERE user_id=$2 RETURNING profile_picture_url`,
      [url, req.user.id]
    );
    if (!rows.length) return error(res, 'Doctor profile not found.', 404);
    return success(res, rows[0], 'Profile picture updated.');
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/doctors/qr-code ────────────────────────────────────────────────
const uploadQrCode = async (req, res, next) => {
  if (!req.file) return error(res, 'No file uploaded.', 400);
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `qr_${uuidv4()}${ext}`;
    const url = await uploadToStorage(req.file.buffer, 'reports', filename, req.file.mimetype);

    const { rows } = await pool.query(
      `UPDATE doctors SET qr_code_url=$1, updated_at=NOW()
       WHERE user_id=$2 RETURNING qr_code_url`,
      [url, req.user.id]
    );
    if (!rows.length) return error(res, 'Doctor profile not found.', 404);
    return success(res, rows[0], 'QR code updated.');
  } catch (err) {
    next(err);
  }
};

// ─── DISEASES ─────────────────────────────────────────────────────────────────

const addDisease = async (req, res, next) => {
  const { disease_name } = req.body;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rows } = await pool.query(
      `INSERT INTO doctor_diseases (doctor_id, disease_name)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [doc.id, disease_name.trim()]
    );

    return success(res, rows[0] || null, 'Disease added.', 201);
  } catch (err) {
    next(err);
  }
};

const removeDisease = async (req, res, next) => {
  const { diseaseId } = req.params;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rowCount } = await pool.query(
      'DELETE FROM doctor_diseases WHERE id = $1 AND doctor_id = $2',
      [diseaseId, doc.id]
    );

    if (!rowCount) return error(res, 'Disease not found.', 404);
    return success(res, null, 'Disease removed.');
  } catch (err) {
    next(err);
  }
};

// ─── CLINICS ──────────────────────────────────────────────────────────────────

const addClinic = async (req, res, next) => {
  const { name, address, city, phone } = req.body;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rows: [clinic] } = await pool.query(
      `INSERT INTO clinics (name, address, city, phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, address, city || null, phone || null]
    );

    await pool.query(
      'INSERT INTO doctor_clinics (doctor_id, clinic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [doc.id, clinic.id]
    );

    return success(res, clinic, 'Clinic added.', 201);
  } catch (err) {
    next(err);
  }
};

const linkClinic = async (req, res, next) => {
  const { clinic_id } = req.body;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    await pool.query(
      'INSERT INTO doctor_clinics (doctor_id, clinic_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [doc.id, clinic_id]
    );

    return success(res, null, 'Clinic linked to your profile.');
  } catch (err) {
    next(err);
  }
};

// ─── SCHEDULES ────────────────────────────────────────────────────────────────

const addSchedule = async (req, res, next) => {
  const { clinic_id, day, start_time, end_time, slot_duration_mins } = req.body;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    // Verify this clinic belongs to the doctor
    const { rows: linked } = await pool.query(
      'SELECT 1 FROM doctor_clinics WHERE doctor_id=$1 AND clinic_id=$2',
      [doc.id, clinic_id]
    );
    if (!linked.length) return error(res, 'Clinic not linked to your profile.', 400);

    const { rows } = await pool.query(
      `INSERT INTO doctor_schedules
         (doctor_id, clinic_id, day, start_time, end_time, slot_duration_mins)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (doctor_id, clinic_id, day, start_time)
       DO UPDATE SET end_time=$5, slot_duration_mins=$6, is_available=true
       RETURNING *`,
      [doc.id, clinic_id, day, start_time, end_time, slot_duration_mins || 30]
    );

    return success(res, rows[0], 'Schedule saved.', 201);
  } catch (err) {
    next(err);
  }
};

const toggleSchedule = async (req, res, next) => {
  const { scheduleId } = req.params;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rows } = await pool.query(
      `UPDATE doctor_schedules
       SET is_available = NOT is_available
       WHERE id = $1 AND doctor_id = $2
       RETURNING *`,
      [scheduleId, doc.id]
    );

    if (!rows.length) return error(res, 'Schedule not found.', 404);
    return success(res, rows[0], `Schedule ${rows[0].is_available ? 'enabled' : 'disabled'}.`);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/doctors/:id/available-slots?date=YYYY-MM-DD ─────────────────────
const getAvailableSlots = async (req, res, next) => {
  const { id } = req.params;
  const { date, clinic_id } = req.query;

  if (!date) return error(res, 'date query param is required (YYYY-MM-DD).', 400);

  try {
    // Parse as local date (append T12:00:00 to avoid UTC midnight crossing timezone boundary)
    const dayName = new Date(`${date}T12:00:00`)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const scheduleQuery = clinic_id
      ? `SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND clinic_id=$2 AND day=$3 AND is_available=true`
      : `SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND day=$2 AND is_available=true`;

    const scheduleParams = clinic_id ? [id, clinic_id, dayName] : [id, dayName];
    const { rows: schedules } = await pool.query(scheduleQuery, scheduleParams);

    if (!schedules.length) {
      return success(res, { slots: [] }, 'No schedules available for this day.');
    }

    // Get already booked slots
    const { rows: booked } = await pool.query(
      `SELECT appointment_time FROM appointments
       WHERE doctor_id=$1 AND appointment_date=$2
       AND status NOT IN ('cancelled')`,
      [id, date]
    );
    const bookedTimes = new Set(booked.map((r) => r.appointment_time.slice(0, 5)));

    // Generate slots for each schedule
    const slots = [];
    for (const sched of schedules) {
      const [sh, sm] = sched.start_time.split(':').map(Number);
      const [eh, em] = sched.end_time.split(':').map(Number);
      let current = sh * 60 + sm;
      const end = eh * 60 + em;

      while (current + sched.slot_duration_mins <= end) {
        const hh = String(Math.floor(current / 60)).padStart(2, '0');
        const mm = String(current % 60).padStart(2, '0');
        const time = `${hh}:${mm}`;
        slots.push({
          time,
          clinic_id: sched.clinic_id,
          is_available: !bookedTimes.has(time),
        });
        current += sched.slot_duration_mins;
      }
    }

    return success(res, { date, slots });
  } catch (err) {
    next(err);
  }
};

const deleteClinic = async (req, res, next) => {
  const { clinicId } = req.params;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1', [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rowCount } = await pool.query(
      'DELETE FROM doctor_clinics WHERE clinic_id=$1 AND doctor_id=$2',
      [clinicId, doc.id]
    );
    if (!rowCount) return error(res, 'Clinic not found on your profile.', 404);

    return success(res, null, 'Clinic removed from your profile.');
  } catch (err) {
    next(err);
  }
};

const deleteSchedule = async (req, res, next) => {
  const { scheduleId } = req.params;
  try {
    const { rows: [doc] } = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1', [req.user.id]
    );
    if (!doc) return error(res, 'Doctor profile not found.', 404);

    const { rowCount } = await pool.query(
      'DELETE FROM doctor_schedules WHERE id=$1 AND doctor_id=$2',
      [scheduleId, doc.id]
    );
    if (!rowCount) return error(res, 'Schedule not found.', 404);

    return success(res, null, 'Schedule deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctors, getDoctorById, getMyProfile, updateProfile,
  updatePaymentInfo, uploadProfilePicture, uploadQrCode,
  addDisease, removeDisease,
  addClinic, linkClinic, deleteClinic,
  addSchedule, toggleSchedule, deleteSchedule,
  getAvailableSlots,
};
