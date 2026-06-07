const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const passwordRules = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.');

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  passwordRules,
  body('phone').optional().isLength({ min: 7, max: 20 }).withMessage('Invalid phone number.'),
  validate,
], register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validate,
], login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  validate,
], forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('reset_token').notEmpty().withMessage('Reset token is required.'),
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  validate,
], resetPassword);

// PATCH /api/auth/change-password
router.patch('/change-password', authenticate, [
  body('current_password').notEmpty().withMessage('Current password is required.'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  validate,
], changePassword);

module.exports = router;
