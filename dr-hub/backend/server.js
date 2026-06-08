require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./src/middleware/errorHandler');
const pool = require('./src/config/db');

async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE doctors
        ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
        ADD COLUMN IF NOT EXISTS hospital_name TEXT,
        ADD COLUMN IF NOT EXISTS hospital_address TEXT,
        ADD COLUMN IF NOT EXISTS bank_name TEXT,
        ADD COLUMN IF NOT EXISTS account_title TEXT,
        ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
        ADD COLUMN IF NOT EXISTS jazzcash_number TEXT,
        ADD COLUMN IF NOT EXISTS easypaisa_number TEXT,
        ADD COLUMN IF NOT EXISTS qr_code_url TEXT
    `);
    console.log('DB migration: doctors columns OK');
  } catch (err) {
    console.error('DB migration error:', err.message);
  }
}

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/doctors', require('./src/routes/doctors'));
app.use('/api/appointments', require('./src/routes/appointments'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/history', require('./src/routes/history'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/messages', require('./src/routes/messages'));
app.use('/api/chat',    require('./src/routes/chat'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Doctor Hub API is running' });
});

app.use(errorHandler);

// Run on every cold start (serverless) and on local startup; IF NOT EXISTS makes it idempotent
runMigrations();

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Doctor Hub backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
