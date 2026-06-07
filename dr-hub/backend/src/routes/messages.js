const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { sendMessage, getConversations, getThread, getContacts } = require('../controllers/messageController');

router.use(authenticate);
router.use(authorize('patient', 'doctor', 'assistant'));

router.get('/contacts', getContacts);
router.get('/', getConversations);
router.get('/:userId', [
  param('userId').isUUID().withMessage('Invalid user ID.'),
  validate,
], getThread);
router.post('/', [
  body('recipient_id').isUUID().withMessage('recipient_id must be a valid UUID.'),
  body('content').trim().notEmpty().withMessage('content is required.'),
  validate,
], sendMessage);

module.exports = router;
