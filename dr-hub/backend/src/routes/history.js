const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  addHistory,
  getHistory,
  getHistoryById,
  addPrescription,
  getPrescriptions,
} = require('../controllers/historyController');

router.use(authenticate);

// POST /api/history  — doctor adds history entry
router.post('/', authorize('doctor'), [
  body('patient_id').isUUID().withMessage('Valid patient_id is required.'),
  body('appointment_id').optional().isUUID().withMessage('Invalid appointment_id.'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required.'),
  body('notes').optional().isLength({ max: 2000 }),
  validate,
], addHistory);

// GET /api/history?patient_id=&page=&limit=
router.get('/', [
  query('patient_id').optional().isUUID().withMessage('Invalid patient_id.'),
  validate,
], getHistory);

// GET /api/history/:id
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid history ID.'),
  validate,
], getHistoryById);

// POST /api/history/:historyId/prescriptions  — doctor only
router.post('/:historyId/prescriptions', authorize('doctor'), [
  param('historyId').isUUID().withMessage('Invalid history ID.'),
  body('medicines')
    .isArray({ min: 1 }).withMessage('medicines must be a non-empty array.')
    .custom((arr) => {
      for (const m of arr) {
        if (!m.name || typeof m.name !== 'string') {
          throw new Error('Each medicine must have a name.');
        }
      }
      return true;
    }),
  body('medicines.*.name').trim().notEmpty(),
  body('medicines.*.dose').optional().isString(),
  body('medicines.*.frequency').optional().isString(),
  body('medicines.*.duration').optional().isString(),
  body('instructions').optional().isLength({ max: 1000 }),
  validate,
], addPrescription);

// GET /api/history/:historyId/prescriptions
router.get('/:historyId/prescriptions', [
  param('historyId').isUUID().withMessage('Invalid history ID.'),
  validate,
], getPrescriptions);

module.exports = router;
