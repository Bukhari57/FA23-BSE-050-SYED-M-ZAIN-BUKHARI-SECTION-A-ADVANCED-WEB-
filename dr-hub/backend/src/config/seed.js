require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const clientConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : { host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD };

const client = new Client(clientConfig);

async function seed() {
  try {
    await client.connect();
    console.log('Seeding database...');

    const hash = async (pw) => bcrypt.hash(pw, 10);

    // Super Admin
    const saHash = await hash('superadmin123');
    const { rows: [superAdmin] } = await client.query(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES ('Super Admin', 'superadmin@doctorhub.com', $1, '0300-0000000', 'super_admin')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [saHash]);

    // Admin
    const adminHash = await hash('admin123');
    const { rows: [admin] } = await client.query(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES ('Admin User', 'admin@doctorhub.com', $1, '0300-1111111', 'admin')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [adminHash]);

    // Doctor user
    const docHash = await hash('doctor123');
    const { rows: [docUser] } = await client.query(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES ('Dr. Ahmed Ali', 'dr.ahmed@doctorhub.com', $1, '0300-2222222', 'doctor')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [docHash]);

    // Doctor profile
    const { rows: [doctor] } = await client.query(`
      INSERT INTO doctors (user_id, specialization, treatment_type, experience_years, qualification, consultation_fee, bio, is_verified)
      VALUES ($1, 'Cardiologist', 'allopathic', 10, 'MBBS, FCPS (Cardiology)', 1500.00, 'Experienced cardiologist with 10 years of practice.', true)
      ON CONFLICT (user_id) DO UPDATE SET specialization = EXCLUDED.specialization
      RETURNING id
    `, [docUser.id]);

    // Doctor diseases
    await client.query(`
      INSERT INTO doctor_diseases (doctor_id, disease_name) VALUES
        ($1, 'Heart Disease'),
        ($1, 'Hypertension'),
        ($1, 'Chest Pain')
      ON CONFLICT DO NOTHING
    `, [doctor.id]);

    // Clinic
    const { rows: [clinic] } = await client.query(`
      INSERT INTO clinics (name, address, city, phone)
      VALUES ('City Heart Clinic', '123 Main Street, Block A', 'Lahore', '042-1234567')
      RETURNING id
    `);

    // Link doctor to clinic
    await client.query(`
      INSERT INTO doctor_clinics (doctor_id, clinic_id) VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [doctor.id, clinic.id]);

    // Doctor schedule
    await client.query(`
      INSERT INTO doctor_schedules (doctor_id, clinic_id, day, start_time, end_time, slot_duration_mins)
      VALUES
        ($1, $2, 'monday',    '09:00', '13:00', 30),
        ($1, $2, 'wednesday', '09:00', '13:00', 30),
        ($1, $2, 'friday',    '14:00', '18:00', 30)
      ON CONFLICT DO NOTHING
    `, [doctor.id, clinic.id]);

    // Patient user
    const patHash = await hash('patient123');
    const { rows: [patUser] } = await client.query(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES ('Ali Patient', 'patient@doctorhub.com', $1, '0300-3333333', 'patient')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [patHash]);

    // Patient profile
    await client.query(`
      INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address)
      VALUES ($1, '1995-05-15', 'male', 'O+', '456 Garden Town, Lahore')
      ON CONFLICT (user_id) DO UPDATE SET gender = EXCLUDED.gender
    `, [patUser.id]);

    // Assistant user
    const asHash = await hash('assistant123');
    const { rows: [asUser] } = await client.query(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES ('Sara Assistant', 'assistant@doctorhub.com', $1, '0300-4444444', 'assistant')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [asHash]);

    await client.query(`
      INSERT INTO assistants (user_id, doctor_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO NOTHING
    `, [asUser.id, doctor.id]);

    console.log('\nSeed data inserted successfully!');
    console.log('─────────────────────────────────────────');
    console.log('  Role         | Email                        | Password');
    console.log('─────────────────────────────────────────');
    console.log('  Super Admin  | superadmin@doctorhub.com     | superadmin123');
    console.log('  Admin        | admin@doctorhub.com          | admin123');
    console.log('  Doctor       | dr.ahmed@doctorhub.com       | doctor123');
    console.log('  Patient      | patient@doctorhub.com        | patient123');
    console.log('  Assistant    | assistant@doctorhub.com      | assistant123');
    console.log('─────────────────────────────────────────');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await client.end();
  }
}

seed();
