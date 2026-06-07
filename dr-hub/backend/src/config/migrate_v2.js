require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const schema = `

-- ─────────────────────────────────────────────
--  NEW ENUMS (safe to add alongside existing ones)
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE report_category AS ENUM (
    'lab_report', 'xray', 'mri', 'ct_scan', 'blood_test',
    'ultrasound', 'ecg', 'prescription_upload', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
--  PATIENT REPORTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by    UUID NOT NULL REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id      UUID REFERENCES doctors(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  category       report_category NOT NULL DEFAULT 'other',
  file_path      VARCHAR(500) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_size      INT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  link       VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient  ON patient_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_reports_category ON patient_reports(category);
CREATE INDEX IF NOT EXISTS idx_patient_reports_doctor   ON patient_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread     ON notifications(user_id, is_read);

`;

async function migrate() {
  try {
    await client.connect();
    console.log('Running v2 migrations...');
    await client.query(schema);
    console.log('v2 tables created successfully (patient_reports, notifications).');
  } catch (err) {
    console.error('Migration v2 failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
