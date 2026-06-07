require('dotenv').config();
const { Client } = require('pg');

const clientConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const client = new Client(clientConfig);

const schema = `

-- ─────────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'assistant', 'admin', 'super_admin');
CREATE TYPE treatment_type AS ENUM ('allopathic', 'homeopathic', 'herbal');
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'payment_uploaded',
  'payment_verified',
  'confirmed',
  'completed',
  'cancelled'
);
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE day_of_week AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');

-- ─────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  phone       VARCHAR(20),
  role        user_role NOT NULL DEFAULT 'patient',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PATIENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth     DATE,
  gender            VARCHAR(10),
  blood_group       VARCHAR(5),
  address           TEXT,
  emergency_contact VARCHAR(20),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
--  CLINICS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(150) NOT NULL,
  address    TEXT NOT NULL,
  city       VARCHAR(100),
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  DOCTORS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization     VARCHAR(150) NOT NULL,
  treatment_type     treatment_type NOT NULL,
  experience_years   INT DEFAULT 0,
  qualification      VARCHAR(255),
  consultation_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  bio                TEXT,
  is_verified        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
--  DOCTOR → CLINIC (many-to-many)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_clinics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  UNIQUE(doctor_id, clinic_id)
);

-- ─────────────────────────────────────────────
--  DOCTOR DISEASES  (for filtering)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_diseases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  disease_name VARCHAR(150) NOT NULL,
  UNIQUE(doctor_id, disease_name)
);

-- ─────────────────────────────────────────────
--  DOCTOR SCHEDULES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id            UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id            UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day                  day_of_week NOT NULL,
  start_time           TIME NOT NULL,
  end_time             TIME NOT NULL,
  slot_duration_mins   INT NOT NULL DEFAULT 30,
  is_available         BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(doctor_id, clinic_id, day, start_time)
);

-- ─────────────────────────────────────────────
--  ASSISTANTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assistants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id  UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─────────────────────────────────────────────
--  APPOINTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  appointment_date  DATE NOT NULL,
  appointment_time  TIME NOT NULL,
  status            appointment_status NOT NULL DEFAULT 'pending',
  patient_notes     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  amount          NUMERIC(10,2) NOT NULL,
  screenshot_path VARCHAR(500),
  status          payment_status NOT NULL DEFAULT 'pending',
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMPTZ,
  rejection_note  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(appointment_id)
);

-- ─────────────────────────────────────────────
--  MEDICAL HISTORY  (append-only — no update/delete)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id      UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis      TEXT NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- no updated_at — history is immutable
);

-- ─────────────────────────────────────────────
--  PRESCRIPTIONS  (append-only — no update/delete)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id UUID NOT NULL REFERENCES medical_history(id) ON DELETE RESTRICT,
  doctor_id          UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  medicines          JSONB NOT NULL DEFAULT '[]',
  instructions       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- no updated_at — prescriptions are immutable
);

-- ─────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_doctors_treatment    ON doctors(treatment_type);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_diseases_name ON doctor_diseases(disease_name);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor  ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status  ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient   ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment    ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON payments(status);

`;

async function migrate() {
  try {
    await client.connect();
    console.log('Running migrations...');
    await client.query(schema);
    console.log('All tables created successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
