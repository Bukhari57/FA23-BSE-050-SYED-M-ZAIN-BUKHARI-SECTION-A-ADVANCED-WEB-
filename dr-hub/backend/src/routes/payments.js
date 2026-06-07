const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadScreenshot,
  getPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
} = require('../controllers/paymentController');

router.use(authenticate);

// POST /api/payments/:appointmentId/upload  — patient only
router.post(
  '/:appointmentId/upload',
  authorize('patient'),
  [param('appointmentId').isUUID().withMessage('Invalid appointment ID.'), validate],
  upload.single('screenshot'),
  uploadScreenshot
);

// GET /api/payments?status=pending|verified|rejected&page=&limit=
router.get('/', authorize('assistant', 'doctor', 'admin', 'super_admin'), [
  query('status').optional().isIn(['pending', 'verified', 'rejected']).withMessage('Invalid status.'),
  validate,
], getPayments);

// GET /api/payments/:id
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid payment ID.'),
  validate,
], getPaymentById);

// PATCH /api/payments/:id/verify  — assistant, admin, super_admin
router.patch('/:id/verify', authorize('assistant', 'admin', 'super_admin'), [
  param('id').isUUID().withMessage('Invalid payment ID.'),
  validate,
], verifyPayment);

// PATCH /api/payments/:id/reject  — assistant, admin, super_admin
router.patch('/:id/reject', authorize('assistant', 'admin', 'super_admin'), [
  param('id').isUUID().withMessage('Invalid payment ID.'),
  body('rejection_note').optional().isLength({ max: 300 }),
  validate,
], rejectPayment);

module.exports = router;
