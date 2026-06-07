const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadReport } = require('../middleware/upload');
const {
  uploadReport: uploadReportCtrl,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
  getNotifications,
  markNotificationsRead,
} = require('../controllers/reportController');

// All routes require authentication
router.use(authenticate);

// ─── Notifications ─────────────────────────────────────────────────────────
router.get('/notifications',      getNotifications);
router.patch('/notifications/read', markNotificationsRead);

// ─── Reports ───────────────────────────────────────────────────────────────
router.post('/',
  authorize('patient'),
  uploadReport.single('report'),
  uploadReportCtrl
);

router.get('/',  authorize('patient', 'doctor', 'admin', 'super_admin'), getReports);
router.get('/:id',       getReportById);
router.get('/:id/file',  downloadReport);
router.delete('/:id',    authorize('patient', 'admin', 'super_admin'), deleteReport);

module.exports = router;
