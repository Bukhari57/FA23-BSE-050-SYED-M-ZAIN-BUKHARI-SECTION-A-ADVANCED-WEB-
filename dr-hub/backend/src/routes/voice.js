const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const { voiceMessage, transcribeAudio } = require('../controllers/voiceController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/message',    authenticate, voiceMessage);
router.post('/transcribe', authenticate, upload.single('audio'), transcribeAudio);

module.exports = router;
