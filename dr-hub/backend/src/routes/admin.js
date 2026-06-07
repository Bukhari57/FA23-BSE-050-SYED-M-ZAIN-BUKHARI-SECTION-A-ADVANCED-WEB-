const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers, getUserById, createUser, toggleUserStatus, deleteUser,
  assignAssistantDoctor,
  getPendingDoctors, verifyDoctor, unverifyDoctor,
  getClinics, deleteClinic,
  getStats,
} = require('../controllers/adminController');

// All admin routes require login + at minimum admin role
router.use(authenticate, authorize('admin', 'super_admin'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', [
  query('role').optional().isIn(['patient','doctor','assistant','admin','super_admin']),
  query('is_active').optional().isBoolean(),
  validate,
], getUsers);

router.get('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID.'),
  validate,
], getUserById);

router.post('/users', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .isIn(['patient','doctor','assistant','admin','super_admin'])
    .withMessage('Invalid role.'),
  body('phone').optional({ checkFalsy: true }).isLength({ min: 7, max: 20 }),
  body('specialization').optional({ checkFalsy: true }).isLength({ max: 150 }),
  body('treatment_type').optional({ checkFalsy: true })
    .isIn(['allopathic','homeopathic','herbal']).withMessage('Invalid treatment type.'),
  body('consultation_fee').optional({ checkFalsy: true }).isNumeric(),
  body('qualification').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('doctor_id').optional({ checkFalsy: true }).isUUID().withMessage('Invalid doctor ID.'),
  validate,
], createUser);

router.patch('/users/:id/toggle', [
  param('id').isUUID().withMessage('Invalid user ID.'),
  validate,
], toggleUserStatus);

// DELETE — super_admin only
router.delete('/users/:id', authorize('super_admin'), [
  param('id').isUUID().withMessage('Invalid user ID.'),
  validate,
], deleteUser);

// ── Assistant Doctor Link ────────────────────────────────────────────────────
router.patch('/assistants/:id/doctor', [
  param('id').isUUID().withMessage('Invalid assistant user ID.'),
  body('doctor_id').isUUID().withMessage('Valid doctor ID is required.'),
  validate,
], assignAssistantDoctor);

// ── Doctor Verification ───────────────────────────────────────────────────────
router.get('/doctors/pending', getPendingDoctors);

router.patch('/doctors/:id/verify', [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  validate,
], verifyDoctor);

router.patch('/doctors/:id/unverify', [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  validate,
], unverifyDoctor);

// ── Clinics ───────────────────────────────────────────────────────────────────
router.get('/clinics', [
  query('city').optional().isString(),
  query('search').optional().isString(),
  validate,
], getClinics);

router.delete('/clinics/:id', authorize('super_admin'), [
  param('id').isUUID().withMessage('Invalid clinic ID.'),
  validate,
], deleteClinic);

module.exports = router;
