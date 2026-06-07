const multer = require('multer');
const path = require('path');

const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  allowedExts.includes(ext)
    ? cb(null, true)
    : cb(new Error('Only JPG, PNG, and PDF files are allowed.'), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

const uploadReport = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: parseInt(process.env.REPORT_MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadReport = uploadReport;
