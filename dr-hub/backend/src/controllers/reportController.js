const { v4: uuidv4 } = require('uuid');
const path = require('path');
const pool = require('../config/db');
const { uploadToStorage, deleteFromStorage } = require('../config/storage');
const { success, error } = require('../utils/response');

// ─── POST /api/reports ────────────────────────────────────────────────────────
// Patient (or admin) uploads a medical report
const uploadReport = async (req, res, next) => {
  if (!req.file) return error(res, 'No file uploaded.', 400);

  const { title, category = 'other', notes, appointment_id } = req.body;
  if (!title) return error(res, 'Report title is required.', 400);

  try {
    const { rows: [patient] } = await pool.query(
      'SELECT id FROM patients WHERE user_id = $1', [req.user.id]
    );
    if (!patient) return error(res, 'Patient profile not found.', 404);

    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `report_${uuidv4()}${ext}`;
    const fileUrl = await uploadToStorage(req.file.buffer, 'reports', filename, req.file.mimetype);

    const { rows: [report] } = await pool.query(
      `INSERT INTO patient_reports
         (patient_id, uploaded_by, appointment_id, title, category, file_path, file_name, file_size, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        patient.id,
        req.user.id,
        appointment_id || null,
        title.trim(),
        category,
        fileUrl,
        req.file.originalname,
        req.file.size,
        notes || null,
      ]
    );

    return success(res, report, 'Report uploaded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports ─────────────────────────────────────────────────────────
// Patient: own reports. Doctor/admin: can query by patient_id param
const getReports = async (req, res, next) => {
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const conditions = [];
    const params = [];

    if (req.user.role === 'patient') {
      const { rows: [patient] } = await pool.query(
        'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
      );
      if (!patient) return success(res, { reports: [], pagination: {} });
      params.push(patient.id);
      conditions.push(`r.patient_id = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`r.category = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM patient_reports r ${where}`, params
    );

    params.push(parseInt(limit), offset);

    const { rows } = await pool.query(
      `SELECT
         r.*,
         u.name AS uploaded_by_name,
         d.id   AS doctor_id_linked,
         ud.name AS doctor_name
       FROM patient_reports r
       JOIN users u ON u.id = r.uploaded_by
       LEFT JOIN doctors d ON d.id = r.doctor_id
       LEFT JOIN users ud ON ud.id = d.user_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return success(res, {
      reports: rows,
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

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
const getReportById = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS uploaded_by_name
       FROM patient_reports r
       JOIN users u ON u.id = r.uploaded_by
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'Report not found.', 404);

    const report = rows[0];

    if (req.user.role === 'patient') {
      const { rows: [patient] } = await pool.query(
        'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
      );
      if (!patient || patient.id !== report.patient_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    return success(res, report);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/:id/file ────────────────────────────────────────────────
// Stream the file for download/view
const downloadReport = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM patient_reports WHERE id=$1', [req.params.id]
    );
    if (!rows.length) return error(res, 'Report not found.', 404);

    const report = rows[0];

    if (req.user.role === 'patient') {
      const { rows: [patient] } = await pool.query(
        'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
      );
      if (!patient || patient.id !== report.patient_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    if (!report.file_path) return error(res, 'File not found.', 404);
    return res.redirect(report.file_path);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/reports/:id ──────────────────────────────────────────────────
const deleteReport = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM patient_reports WHERE id=$1', [req.params.id]
    );
    if (!rows.length) return error(res, 'Report not found.', 404);

    const report = rows[0];

    if (req.user.role === 'patient') {
      const { rows: [patient] } = await pool.query(
        'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
      );
      if (!patient || patient.id !== report.patient_id) {
        return error(res, 'Access denied.', 403);
      }
    } else if (!['admin', 'super_admin'].includes(req.user.role)) {
      return error(res, 'Access denied.', 403);
    }

    if (report.file_path) {
      const filename = report.file_path.split('/').pop()?.split('?')[0];
      if (filename) await deleteFromStorage('reports', filename);
    }

    await pool.query('DELETE FROM patient_reports WHERE id=$1', [req.params.id]);
    return success(res, null, 'Report deleted.');
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/notifications ──────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id=$1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    const unread = rows.filter((n) => !n.is_read).length;
    return success(res, { notifications: rows, unread });
  } catch (err) {
    next(err);
  }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read=true WHERE user_id=$1',
      [req.user.id]
    );
    return success(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
  getNotifications,
  markNotificationsRead,
};
