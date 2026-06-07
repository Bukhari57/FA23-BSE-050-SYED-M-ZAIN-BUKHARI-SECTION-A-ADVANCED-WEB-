const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');

// All appointment routes require login
router.use(authenticate);

// POST /api/appointments  — patient books
router.post('/', authorize('patient'), [
  body('doctor_id').isUUID().withMessage('Valid doctor_id is required.'),
  body('clinic_id').isUUID().withMessage('Valid clinic_id is required.'),
  body('appointment_date')
    .isISO8601().withMessage('appointment_date must be YYYY-MM-DD.')
    .custom((v) => {
      if (new Date(v) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error('Appointment date cannot be in the past.');
      }
      return true;
    }),
  body('appointment_time')
    .matches(/^\d{2}:\d{2}$/).withMessage('appointment_time must be HH:MM.'),
  body('patient_notes').optional().isLength({ max: 500 }),
  validate,
], bookAppointment);

// GET /api/appointments?status=&date=&page=&limit=
router.get('/', [
  query('status').optional().isIn([
    'pending','payment_uploaded','payment_verified','confirmed','completed','cancelled'
  ]).withMessage('Invalid status.'),
  query('date').optional().isISO8601().withMessage('date must be YYYY-MM-DD.'),
  validate,
], getAppointments);

// GET /api/appointments/:id
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
  validate,
], getAppointmentById);

// PATCH /api/appointments/:id/cancel  — patient, doctor, assistant, admin
router.patch('/:id/cancel', [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
  validate,
], cancelAppointment);

// PATCH /api/appointments/:id/complete  — doctor only
router.patch('/:id/complete', authorize('doctor'), [
  param('id').isUUID().withMessage('Invalid appointment ID.'),
  validate,
], completeAppointment);

module.exports = router;
