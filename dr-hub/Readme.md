
# Doctor Hub — Healthcare Management Platform

A full-stack healthcare platform connecting patients with verified doctors. Patients can search doctors, book appointments, upload payment screenshots, view medical history, manage prescriptions, and message their doctors directly. Doctors manage their profile, clinics, schedules, patient records, and prescriptions. Assistants verify payments. Admins manage the entire platform.

**Live Demo:** [https://drhubbyzain.vercel.app](https://drhubbyzain.vercel.app)
**Backend API:** [https://backend-alpha-six-11.vercel.app](https://backend-alpha-six-11.vercel.app)

---

## Demo Accounts

| Role        | Email                          | Password       |
|-------------|-------------------------------|----------------|
| Super Admin | superadmin@doctorhub.com       | superadmin123  |
| Admin       | admin@doctorhub.com            | admin123       |
| Doctor      | dr.ahmed@doctorhub.com         | doctor123      |
| Patient     | patient@doctorhub.com          | patient123     |
| Assistant   | assistant@doctorhub.com        | assistant123   |

---

## Features

### Patient
- Register / Login / Forgot Password
- Search and filter verified doctors (by name, specialization, treatment type, city, disease/condition)
- Book appointments at a doctor's clinic from available time slots
- Upload payment screenshots for booked appointments
- View appointment status (pending → payment uploaded → confirmed → completed)
- View medical history added by doctors
- View and print prescriptions
- Upload and manage medical reports (X-rays, lab results, scans)
- **Message doctors** — real-time polling chat with any doctor you've had an appointment with
- **Notifications** — bell icon shows alerts for payment verified/rejected, medical records added, and incoming messages

### Doctor
- Manage professional profile (specialization, qualification, fee, bio, treatment type)
- Add / remove conditions treated (used for patient search filtering)
- Add / delete clinics and link them to your profile
- Add / delete / toggle availability of weekly schedules per clinic
- View all appointments for your clinic
- Mark appointments as completed
- Add medical history records for patients with confirmed or completed appointments
- Add prescriptions to medical history records
- **Message patients** — chat with any patient who has booked with you
- Notifications for new bookings

### Assistant
- Assigned to a specific doctor (shown on dashboard)
- View and verify / reject payment screenshots uploaded by patients
- Payments that are verified automatically confirm the appointment
- Rejected payments notify the patient to re-upload

### Admin / Super Admin
- Platform-wide analytics dashboard (users, doctors, appointments, revenue, charts)
- Manage and activate/deactivate users
- Verify or reject doctor registrations
- View all clinics
- View and manage all payments

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| React Router DOM | 7 | SPA routing |
| Axios | 1.x | HTTP client |
| Recharts | 3.x | Admin analytics charts |
| Tailwind CSS | 3.x | Utility-first styling |
| Vite | 8.x | Build tool |

### Backend
| Library | Version | Purpose |
|---|---|---|
| Express | 4.x | HTTP server / REST API |
| pg (node-postgres) | 8.x | PostgreSQL client |
| @supabase/supabase-js | 2.x | Supabase Storage (file uploads) |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| multer | 1.x | Multipart file parsing (memory storage) |
| express-validator | 7.x | Request validation |
| uuid | 10.x | UUID generation |
| dotenv | 16.x | Environment variables |

### Infrastructure
| Service | Usage |
|---|---|
| Supabase | PostgreSQL database + file storage (payments bucket, reports bucket) |
| Vercel | Frontend + Backend serverless deployment |

---

## Project Structure

```
doctor-hub/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── vercel.json                  # Vercel serverless config
│   └── src/
│       ├── config/
│       │   ├── db.js                # PostgreSQL pool (supports DATABASE_URL + SSL)
│       │   ├── migrate.js           # Full schema migration script
│       │   ├── seed.js              # Demo data seeder
│       │   └── storage.js           # Supabase Storage upload/delete helpers
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── appointmentController.js
│       │   ├── authController.js
│       │   ├── doctorController.js
│       │   ├── historyController.js
│       │   ├── messageController.js
│       │   ├── paymentController.js
│       │   └── reportController.js
│       ├── middleware/
│       │   ├── auth.js              # JWT authenticate + authorize(roles)
│       │   ├── errorHandler.js      # Global error handler
│       │   ├── upload.js            # Multer memory storage configs
│       │   └── validate.js          # express-validator error formatter
│       ├── routes/
│       │   ├── admin.js
│       │   ├── appointments.js
│       │   ├── auth.js
│       │   ├── doctors.js
│       │   ├── history.js
│       │   ├── messages.js
│       │   ├── payments.js
│       │   └── reports.js
│       └── utils/
│           └── response.js          # Standardised success/error helpers
│
└── frontend/
    ├── vercel.json                  # SPA fallback rewrite rule
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                  # Routes + AppLayout (sidebar state)
        ├── api/
        │   └── axios.js             # Axios instance with base URL + JWT interceptor
        ├── components/
        │   ├── Icons.jsx            # All SVG icons as React components
        │   ├── Navbar.jsx           # Top bar with notifications bell + user menu
        │   ├── Sidebar.jsx          # Desktop static + mobile slide-in drawer
        │   └── PrivateRoute.jsx     # Route guard (role-based)
        ├── context/
        │   └── AuthContext.jsx      # Auth state, login, logout, token storage
        └── pages/
            ├── auth/                Login, Register, ForgotPassword
            ├── patient/             Dashboard, DoctorSearch, BookAppointment,
            │                        MyAppointments, MedicalHistory, Reports,
            │                        Prescriptions, Messages
            ├── doctor/              Dashboard, Appointments, Profile,
            │                        PatientHistory, Messages
            ├── assistant/           Dashboard, Payments
            └── admin/               Dashboard, Users, DoctorVerification, Clinics
```

---

## Database Schema

### Tables

| Table | Description |
|---|---|
| `users` | All accounts — role: `patient`, `doctor`, `assistant`, `admin`, `super_admin` |
| `patients` | Patient profile (DOB, gender, blood group, emergency contact) |
| `doctors` | Doctor profile (specialization, fee, bio, is_verified) |
| `assistants` | Links an assistant user to a doctor |
| `clinics` | Clinic details (name, address, city, phone) |
| `doctor_clinics` | Many-to-many: doctor ↔ clinic |
| `doctor_diseases` | Conditions a doctor treats (used for search filtering) |
| `doctor_schedules` | Weekly slots per doctor per clinic (day, start_time, end_time, slot_duration_mins) |
| `appointments` | Booking record — status flow: `pending` → `payment_uploaded` → `confirmed` → `completed` |
| `payments` | Payment screenshot for an appointment — status: `pending`, `verified`, `rejected` |
| `medical_history` | Doctor-written diagnosis + notes linked to an appointment |
| `prescriptions` | JSONB medicines array linked to a medical history record |
| `patient_reports` | Files (lab results, X-rays) uploaded by patients, stored in Supabase Storage |
| `messages` | Direct messages between users (patient ↔ doctor) |
| `notifications` | Per-user in-app notifications (bell icon) |

---

## API Reference

All routes are prefixed `/api`. Authenticated routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create patient account |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/forgot-password` | Public | Reset password by email |

### Doctors — `/api/doctors`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List verified doctors (filters: search, treatment_type, specialization, city, disease, page, limit) |
| GET | `/:id` | Public | Get doctor by ID |
| GET | `/:id/slots` | Public | Available time slots for a given date |
| GET | `/profile/me` | Doctor | My full profile |
| PUT | `/profile` | Doctor | Update profile |
| POST | `/diseases` | Doctor | Add treated condition |
| DELETE | `/diseases/:id` | Doctor | Remove treated condition |
| POST | `/clinics` | Doctor | Create new clinic and link to profile |
| POST | `/clinics/link` | Doctor | Link existing clinic by ID |
| DELETE | `/clinics/:id` | Doctor | Unlink clinic from profile |
| POST | `/schedules` | Doctor | Add weekly schedule |
| PATCH | `/schedules/:id/toggle` | Doctor | Toggle schedule availability |
| DELETE | `/schedules/:id` | Doctor | Delete schedule |

### Appointments — `/api/appointments`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Book appointment |
| GET | `/` | All roles | List appointments (role-scoped) |
| GET | `/:id` | All roles | Get appointment by ID |
| PATCH | `/:id/cancel` | Patient/Admin | Cancel appointment |
| PATCH | `/:id/complete` | Doctor | Mark as completed |

### Payments — `/api/payments`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/:appointmentId/upload` | Patient | Upload payment screenshot |
| GET | `/` | Assistant/Admin | List payments |
| GET | `/:id` | All roles | Get payment by ID |
| PATCH | `/:id/verify` | Assistant/Admin | Verify payment (confirms appointment) |
| PATCH | `/:id/reject` | Assistant/Admin | Reject payment |

### Medical History — `/api/history`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | Doctor | Add history record |
| GET | `/` | Patient/Doctor/Admin | List history (role-scoped) |
| GET | `/:id` | Role-scoped | Get record by ID |
| POST | `/:historyId/prescriptions` | Doctor | Add prescription |
| GET | `/:historyId/prescriptions` | Role-scoped | Get prescriptions |

### Reports — `/api/reports`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Upload medical report |
| GET | `/` | Patient/Doctor/Admin | List reports |
| GET | `/:id` | Role-scoped | Get report details |
| GET | `/:id/file` | Role-scoped | Download / view file (redirects to Supabase signed URL) |
| DELETE | `/:id` | Patient/Admin | Delete report |
| GET | `/notifications` | All | Get user notifications |
| PATCH | `/notifications/read` | All | Mark all notifications as read |

### Messages — `/api/messages`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/contacts` | Patient/Doctor | List people you can message (from shared appointments) |
| GET | `/` | Patient/Doctor | List all conversations |
| GET | `/:userId` | Patient/Doctor | Get message thread with a user |
| POST | `/` | Patient/Doctor | Send a message |

### Admin — `/api/admin`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform-wide statistics for dashboard |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/:id/toggle` | Admin | Activate / deactivate user |
| GET | `/doctors` | Admin | List doctors (with verification status) |
| PATCH | `/doctors/:id/verify` | Admin | Verify doctor |
| PATCH | `/doctors/:id/reject` | Admin | Reject doctor verification |
| GET | `/clinics` | Admin | List all clinics |

---

## Environment Variables

### Backend (`backend/.env`)
```env
# Database — Supabase Transaction Pooler (IPv4 compatible)
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Supabase Storage
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# CORS
FRONTEND_URL=https://drhubbyzain.vercel.app

# Local dev only
PORT=5001
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://backend-alpha-six-11.vercel.app/api
```

For local development:
```env
VITE_API_URL=http://localhost:5001/api
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local) **or** Supabase project
- npm

### 1. Clone and install
```bash
git clone <repo-url>
cd doctor-hub

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy and fill in the `.env` files as shown in the [Environment Variables](#environment-variables) section above.

### 3. Run database migrations
```bash
cd backend
npm run migrate
```

### 4. Seed demo data
```bash
npm run seed
```

### 5. Start the servers

**Backend (terminal 1):**
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

**Frontend (terminal 2):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and log in with any demo account.

---

## Deployment

The project is deployed on **Vercel** as two separate projects.

### Backend
```bash
cd backend
npx vercel --prod
```

Required Vercel environment variables (set in Vercel dashboard):
- `DATABASE_URL`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FRONTEND_URL`

The `vercel.json` routes all requests through `server.js`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

### Frontend
```bash
cd frontend
npx vercel --prod
```

The `vercel.json` handles SPA client-side routing:
```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

Required Vercel environment variable:
- `VITE_API_URL` — set to your deployed backend URL + `/api`

---

## Supabase Setup

### Storage Buckets
Create two public storage buckets in your Supabase dashboard:
1. `payments` — stores payment screenshots uploaded by patients
2. `reports` — stores medical report files uploaded by patients

### Database Connection
Use the **Transaction Pooler** connection string (not the direct connection) to ensure IPv4 compatibility with Vercel:

```
postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
```

Find this in: Supabase Dashboard → Project Settings → Database → Connection string → Transaction pooler

---

## Role-Based Access Control

| Route / Action | Patient | Doctor | Assistant | Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Book appointment | ✅ | | | | |
| Upload payment | ✅ | | | | |
| View own appointments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add medical history | | ✅ | | | |
| Add prescription | | ✅ | | | |
| Verify/reject payment | | | ✅ | ✅ | ✅ |
| Verify doctor | | | | ✅ | ✅ |
| Manage all users | | | | ✅ | ✅ |
| View platform stats | | | | ✅ | ✅ |
| Message contacts | ✅ | ✅ | | | |

---

## Notification Events

The bell icon in the navbar shows in-app notifications for the following events:

| Event | Who is notified |
|---|---|
| Appointment booked | Doctor |
| Payment verified | Patient |
| Payment rejected | Patient |
| Medical record added | Patient |
| Message received | Recipient |

---

## Appointment Status Flow

```
Patient books
     │
     ▼
  pending  ──────────────────────────► cancelled
     │
     │  Patient uploads payment screenshot
     ▼
payment_uploaded ───────────────────► cancelled
     │
     │  Assistant/Admin verifies payment
     ▼
  confirmed ──────────────────────► cancelled
     │
     │  Doctor marks completed
     ▼
  completed
```
