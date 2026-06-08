const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDoctors, getDoctorById, getMyProfile, updateProfile,
  updatePaymentInfo, uploadProfilePicture, uploadQrCode,
  addDisease, removeDisease,
  addClinic, linkClinic, deleteClinic,
  addSchedule, toggleSchedule, deleteSchedule,
  getAvailableSlots,
} = require('../controllers/doctorController');

const doctorOnly = [authenticate, authorize('doctor')];

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/doctors?treatment_type=&disease=&city=&search=&page=&limit=
router.get('/', getDoctors);

// GET /api/doctors/:id
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  validate,
], getDoctorById);

// GET /api/doctors/:id/slots?date=YYYY-MM-DD&clinic_id=
router.get('/:id/slots', [
  param('id').isUUID().withMessage('Invalid doctor ID.'),
  query('date').isISO8601().withMessage('date must be YYYY-MM-DD.'),
  validate,
], getAvailableSlots);

// ── Doctor-only routes ────────────────────────────────────────────────────────

// GET /api/doctors/profile/me
router.get('/profile/me', doctorOnly, getMyProfile);

// PUT /api/doctors/profile
router.put('/profile', [...doctorOnly,
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty.'),
  body('treatment_type').optional().isIn(['allopathic','homeopathic','herbal']).withMessage('Invalid treatment type.'),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer.'),
  body('consultation_fee').optional().isFloat({ min: 0 }).withMessage('Fee must be a positive number.'),
  validate,
], updateProfile);

// PUT /api/doctors/payment-info
router.put('/payment-info', doctorOnly, updatePaymentInfo);

// POST /api/doctors/profile-picture
router.post('/profile-picture', [...doctorOnly, upload.single('file')], uploadProfilePicture);

// POST /api/doctors/qr-code
router.post('/qr-code', [...doctorOnly, upload.single('file')], uploadQrCode);

// POST /api/doctors/diseases
router.post('/diseases', [...doctorOnly,
  body('disease_name').trim().notEmpty().withMessage('Disease name is required.'),
  validate,
], addDisease);

// DELETE /api/doctors/diseases/:diseaseId
router.delete('/diseases/:diseaseId', [...doctorOnly,
  param('diseaseId').isUUID().withMessage('Invalid disease ID.'),
  validate,
], removeDisease);

// POST /api/doctors/clinics  (create new clinic + link)
router.post('/clinics', [...doctorOnly,
  body('name').trim().notEmpty().withMessage('Clinic name is required.'),
  body('address').trim().notEmpty().withMessage('Clinic address is required.'),
  body('city').optional().notEmpty(),
  body('phone').optional().isLength({ min: 7, max: 20 }),
  validate,
], addClinic);

// POST /api/doctors/clinics/link  (link existing clinic by id)
router.post('/clinics/link', [...doctorOnly,
  body('clinic_id').isUUID().withMessage('Valid clinic_id is required.'),
  validate,
], linkClinic);

// POST /api/doctors/schedules
router.post('/schedules', [...doctorOnly,
  body('clinic_id').isUUID().withMessage('Valid clinic_id is required.'),
  body('day').isIn(['monday','tuesday','wednesday','thursday','friday','saturday','sunday']).withMessage('Invalid day.'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM.'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('end_time must be HH:MM.'),
  body('slot_duration_mins').optional().isInt({ min: 10, max: 120 }),
  validate,
], addSchedule);

// PATCH /api/doctors/schedules/:scheduleId/toggle
router.patch('/schedules/:scheduleId/toggle', [...doctorOnly,
  param('scheduleId').isUUID().withMessage('Invalid schedule ID.'),
  validate,
], toggleSchedule);

// DELETE /api/doctors/clinics/:clinicId
router.delete('/clinics/:clinicId', [...doctorOnly,
  param('clinicId').isUUID().withMessage('Invalid clinic ID.'),
  validate,
], deleteClinic);

// DELETE /api/doctors/schedules/:scheduleId
router.delete('/schedules/:scheduleId', [...doctorOnly,
  param('scheduleId').isUUID().withMessage('Invalid schedule ID.'),
  validate,
], deleteSchedule);

module.exports = router;
