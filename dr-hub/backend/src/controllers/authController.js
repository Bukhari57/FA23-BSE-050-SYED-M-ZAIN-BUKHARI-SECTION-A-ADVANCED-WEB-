const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { success, error } = require('../utils/response');

const signToken = (id, role, email) =>
  jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return error(res, 'Email already registered.', 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, 'patient')
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), hashed, phone || null]
    );

    const user = rows[0];

    // Auto-create empty patient profile
    await pool.query(
      'INSERT INTO patients (user_id) VALUES ($1)',
      [user.id]
    );

    const token = signToken(user.id, user.role, user.email);
    return success(res, { token, user }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!rows.length) {
      return error(res, 'Invalid email or password.', 401);
    }

    const user = rows[0];

    if (!user.is_active) {
      return error(res, 'Your account has been deactivated. Contact support.', 403);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return error(res, 'Invalid email or password.', 401);
    }

    const token = signToken(user.id, user.role, user.email);

    const { password: _, ...safeUser } = user;
    return success(res, { token, user: safeUser }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
              p.id AS patient_id, p.date_of_birth, p.gender, p.blood_group, p.address,
              d.id AS doctor_id, d.specialization, d.treatment_type, d.is_verified
       FROM users u
       LEFT JOIN patients  p ON p.user_id = u.id AND u.role = 'patient'
       LEFT JOIN doctors   d ON d.user_id = u.id AND u.role = 'doctor'
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!rows.length) return error(res, 'User not found.', 404);
    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
// Returns a short-lived reset token (in production this would be emailed)
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return 200 to prevent email enumeration
    if (!rows.length) {
      return success(res, null, 'If that email exists, a reset link has been sent.');
    }

    const user = rows[0];
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // In production: send resetToken via email
    // For development: return it directly
    return success(
      res,
      { reset_token: resetToken },
      'Password reset token generated. (Send via email in production.)'
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  const { reset_token, new_password } = req.body;

  try {
    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch {
      return error(res, 'Reset token is invalid or expired.', 400);
    }

    if (decoded.purpose !== 'reset') {
      return error(res, 'Invalid reset token.', 400);
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashed, decoded.id]
    );

    return success(res, null, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/change-password  (authenticated)
const changePassword = async (req, res, next) => {
  const { current_password, new_password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match) return error(res, 'Current password is incorrect.', 400);

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashed, req.user.id]
    );

    return success(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, changePassword };
