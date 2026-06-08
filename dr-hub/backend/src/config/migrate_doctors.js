// One-time migration to add missing doctor columns
// Run via: node src/config/migrate_doctors.js
require('dotenv').config();
const pool = require('./db');

async function migrate() {
  console.log('Running doctors table migration...');
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
  const { rows } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='doctors' ORDER BY column_name`);
  console.log('Columns:', rows.map(r => r.column_name).join(', '));
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(e => { console.error(e.message); process.exit(1); });
