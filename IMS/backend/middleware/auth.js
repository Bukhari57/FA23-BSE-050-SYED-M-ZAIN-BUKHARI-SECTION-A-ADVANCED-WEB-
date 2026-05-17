const jwt = require('jsonwebtoken');

const ALLOW_INSECURE_DEV = process.env.ALLOW_INSECURE_DEV === 'true';

function authenticate(req, res, next) {
  // Development bypass: when enabled, allow requests without Bearer token
  // and inject a dev `req.user`. DO NOT enable this in production.
  if (ALLOW_INSECURE_DEV) {
    if (!req.headers.authorization) {
      console.warn('ALLOW_INSECURE_DEV is enabled — granting dev user for request');
      req.user = { id: 1, name: 'dev', role: 'admin' };
      return next();
    }
    // if an Authorization header is present, fallthrough to normal verification
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
