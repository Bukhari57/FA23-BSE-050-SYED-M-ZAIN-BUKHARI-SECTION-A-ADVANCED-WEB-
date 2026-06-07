const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { error } = require('../utils/response');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length) return error(res, 'User not found.', 401);
    if (!rows[0].is_active) return error(res, 'Account is deactivated.', 403);

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expired.', 401);
    return error(res, 'Invalid token.', 401);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, 'Access denied. Insufficient permissions.', 403);
  }
  next();
};

module.exports = { authenticate, authorize };
