# Doctor Hub — Healthcare Management Platform

A full-stack healthcare platform connecting patients with verified doctors. Patients search and book appointments, upload payment proofs, track medical history, prescriptions, reports, and message doctors directly. Doctors manage their clinics, schedules, patient records, and prescriptions. Assistants verify payments. Admins run the whole platform with live analytics.

**Live:** [https://drhubbyzain.vercel.app](https://drhubbyzain.vercel.app) &nbsp;|&nbsp; **API:** [https://backend-alpha-six-11.vercel.app/api/health](https://backend-alpha-six-11.vercel.app/api/health)

---

## Screenshots

### Authentication

| Login | Register |
|-------|----------|
| ![Login](screenshots/21-login.png) | ![Register](screenshots/22-register.png) |

> Split-screen layout — marketing panel with stats on the left, auth form with demo-account shortcuts on the right. Show/hide password toggle on all password fields.

---

### Patient Portal

#### Dashboard
![Patient Dashboard](screenshots/01-patient-dashboard.png)
> Welcome banner with the patient's name, next appointment countdown, stat cards (Total / Upcoming / Completed), and Quick Action shortcuts to every feature.

---

#### Find Doctors
![Find Doctors](screenshots/02-find-doctors.png)
> Search verified doctors by name, specialization, treatment type (allopathic / homeopathic / herbal), city, and disease/condition. Each card shows the doctor's **profile picture**, experience, fee, clinic city, hospital name, and treated conditions as tags. One click goes to the booking form.

---

#### My Appointments
![My Appointments](screenshots/03-my-appointments.png)
> Full list of bookings with status badges (Pending / Payment Uploaded / Confirmed / Completed / Cancelled). Patients can upload a payment screenshot or cancel directly from this page. **Doctor payment details** (bank account, JazzCash, EasyPaisa, QR code) are displayed alongside each booking so patients can send the fee immediately.

---

#### Medical History
![Medical History](screenshots/04-medical-history.png)
> Read-only view of all diagnoses and notes added by doctors after consultations. Records are immutable — the "Immutable records" badge reinforces data integrity.

---

#### My Reports
![My Reports](screenshots/05-my-reports.png)
> Upload and organise lab results, X-rays, MRI scans, blood tests, and more. Files are stored in Supabase Storage and categorised by type with a filter tab bar.

---

#### Prescriptions
![Prescriptions](screenshots/06-prescriptions.png)
> Digital prescriptions issued by doctors — printable and downloadable. Shows totals for prescriptions, medical records, and treating doctors.

---

### Doctor Portal

#### Dashboard
![Doctor Dashboard](screenshots/07-doctor-dashboard.png)
> "Good day, [Name]" greeting (no double "Dr." prefix), today's appointment count, pending/confirmed counts, total patients, appointment breakdown bar chart, today's schedule, and quick-action links to all tools.

---

#### Appointments
![Doctor Appointments](screenshots/08-doctor-appointments.png)
> All patient appointments with status (Pending / Confirmed). Confirmed appointments show a **Mark Complete** button. Filter by status from the dropdown.

---

#### My Profile — Professional Details
![Doctor Profile](screenshots/09-doctor-profile.png)
> Edit specialization, qualification, experience, consultation fee, treatment type, bio, **profile picture**, **hospital name**, **hospital address**, and **payment details** (bank name, account title, account number, JazzCash, EasyPaisa, QR code image). A "Verified" badge appears once the admin approves the doctor.

---

#### My Profile — Clinics
![Doctor Clinics](screenshots/10-doctor-clinics.png)
> Add and manage clinics (name, address, city, phone). Each clinic card shows a delete button. Clinics power the booking flow — patients pick a clinic when scheduling.

---

#### My Profile — Schedules
![Doctor Schedules](screenshots/11-doctor-schedules.png)
> Weekly availability per clinic. Each slot shows the day, time range, slot duration, and clinic name. Toggle availability on/off or delete a schedule entirely.

---

#### Patient History — View
![Patient History](screenshots/12-patient-history.png)
> Three-tab interface: **History** (view records), **Add Record** (write diagnosis), **Add Prescription** (add medicines). Displays all records the doctor has added.

---

#### Patient History — Add Medical Record
![Add Medical Record](screenshots/13-add-medical-record.png)
> Select a confirmed or completed appointment from the dropdown, enter diagnosis, and add optional doctor's notes. Saves as a permanent immutable record.

---

#### Patient History — Add Prescription
![Add Prescription](screenshots/14-add-prescription.png)
> Select a history record, then add medicines (name, dose, frequency, duration) with an "+ Add another medicine" button, plus optional patient instructions.

---

### Assistant Portal

#### Payment Verification
![Assistant Payments](screenshots/15-assistant-payments.png)
> Assistants see only payments for their assigned doctor. Pending / Verified / Rejected tabs. Click a payment to preview the uploaded screenshot on the right panel, then verify or reject with a note.

---

### Admin / Super Admin Portal

#### Admin Dashboard
![Admin Dashboard](screenshots/16-admin-dashboard.png)
> Full analytics: Total Users, Patients, Doctors (pending verification count), Revenue, Appointments, Clinics, Medical Records — all as stat cards. Monthly revenue + appointment trend area chart, payment status pie chart, appointment breakdown bar chart, and quick-action shortcuts.

---

#### User Management
![Admin Users](screenshots/17-admin-users.png)
> All users listed with role badges, verification status, and action buttons: **Deactivate** (toggle active), **Delete**, and **Reassign** for assistants. Search by name/email or filter by role.

---

#### Doctor Verification
![Doctor Verification](screenshots/18-admin-doctor-verification.png)
> Pending and Verified tabs. Admins see each doctor's specialization, treatment type, and contact. One-click **Verify** or **Revoke** actions.

---

#### Clinics
![Admin Clinics](screenshots/19-admin-clinics.png)
> Platform-wide clinic registry — name, address, city, phone, number of linked doctors. Searchable and filterable by city.

---

#### Payment Management (Admin)
![Admin Payments](screenshots/20-admin-payments.png)
> Admin-level payment verification panel showing all payments across every doctor, clinic, and appointment — same verify/reject interface as assistants but with full platform scope.

---

### Doctor Hub AI — Chat Assistant

![AI Chat Widget](screenshots/Screenshot%202026-06-08%20at%209.18.32%20AM.png)
> Floating AI assistant available on every page. Custom medical cross + EKG icon, pill-shaped FAB with animated "online" dot, quick-action chips (Find Doctors, Appointments, Prescriptions, Payments), and a unified frosted-glass input bar. Powered by Groq (Llama 3.3 70B).

---

## Demo Accounts

| Role        | Email                        | Password      |
|-------------|------------------------------|---------------|
| Super Admin | superadmin@doctorhub.com     | superadmin123 |
| Admin       | admin@doctorhub.com          | admin123      |
| Doctor      | dr.ahmed@doctorhub.com       | doctor123     |
| Patient     | patient@doctorhub.com        | patient123    |
| Assistant   | assistant@doctorhub.com      | assistant123  |

---

## Features

### Patient
- Register / Login / Forgot Password
- Search verified doctors — filter by name, specialization, treatment type, city, disease/condition
- Book appointments by selecting a clinic and available time slot
- **View doctor profile pictures, hospital name, and payment details** on the booking and appointments pages
- Upload payment screenshots; re-upload if rejected
- Track all appointments by status with one-click cancel
- View immutable medical history records added by doctors
- View, print, and download digital prescriptions
- Upload and organise medical reports by type (Lab, X-Ray, MRI, CT, Blood Test)
- **Real-time messaging** with any doctor you have an appointment with
- **Bell notifications** — payment verified/rejected, new records, messages

### Doctor
- Manage professional profile (specialization, qualification, fee, bio, treatment type)
- **Upload profile picture** — displayed to patients on search and booking pages
- **Set hospital name and address** — shown to patients
- **Add payment details** — bank name, account title, account number, JazzCash number, EasyPaisa number, QR code image; patients see these on their appointments page
- Add / remove conditions treated (searchable by patients)
- Add / delete clinics; link multiple clinics to one profile
- Add / delete / toggle weekly schedules per clinic with configurable slot durations
- View all patient appointments; mark confirmed ones as completed
- Add permanent medical history records for confirmed/completed appointments
- Add digital prescriptions with full medicine details
- **Message patients** directly from the Messages page
- Notifications for new bookings

### Assistant
- Assigned to a specific doctor (shown on dashboard)
- Preview payment screenshots in-browser
- Verify payments (automatically confirms the appointment) or reject with a note
- Rejected payments trigger a patient notification to re-upload

### Admin / Super Admin
- Platform analytics dashboard with charts (revenue trend, appointment breakdown, payment pie)
- Create, activate/deactivate, delete, or reassign users
- Verify or revoke doctor registrations
- View all clinics platform-wide
- Full payment oversight across all doctors and clinics

### Doctor Hub AI Assistant
- **Floating chat widget** available on every authenticated page — no page navigation needed
- **Custom AI icon** — medical cross + heartbeat EKG pulse SVG, gradient blue-to-violet
- **Quick action chips** — Find Doctors, Appointments, Prescriptions, Payments
- **Voice input** — click mic to speak your question
  - Supports English, Urdu script, and Roman Urdu
  - **iOS Safari fix**: voice starts synchronously to preserve the user-gesture chain (no "service not allowed" error)
  - **iOS Urdu fallback**: `ur-PK` is unsupported on iOS Safari; automatically falls back to `en-US` with a hint to speak in Roman Urdu
- **Multilingual responses**:
  - Urdu script input → replies in Urdu Nastaleeq (never Devanagari/Hindi)
  - Roman Urdu input → replies in Roman Urdu matching the user's spelling style
  - English → replies in English
- **Live platform data**: "show my appointments", "list doctors", "show prescriptions", "payment history", "clinic list" — all pull real data from the database
- **Full Doctor Hub guide** — chatbot knows every feature, the booking flow, payment methods, and step-by-step instructions
- **Casual conversation** — responds naturally to greetings ("hi", "kesy ho", "salam"), thanks, and small-talk
- **Emergency escalation** — detects chest pain, breathing difficulty, etc. and immediately directs to Rescue 1122 / Edhi 115
- Powered by **Groq API** (Llama 3.3 70B Versatile) for sub-second responses

---

## UI / UX Design System

The entire product was redesigned with a consistent, professional design language:

| Token | Value |
|---|---|
| Font | Inter (variable weight) — `font-black` headings, `font-semibold` labels |
| Primary gradient | `from-blue-600 to-indigo-600` |
| Border radius | `rounded-xl` cards, `rounded-2xl` panels, `rounded-3xl` modals |
| Glass effect | `bg-white/95 backdrop-blur-md` (Navbar), `bg-white/10 backdrop-blur-sm` (hero overlays) |
| Dark mode | `darkMode: 'class'` — all surfaces, text, borders, and shadows have dark variants |
| Animations | `fade-in`, `slide-up`, `slide-in-left`, `scale-in`, `shimmer` (loading skeletons) |
| Sidebar | Gradient active state with left accent bar; role badges with per-role colours |
| Navbar | Frosted-glass header; notification panel with empty state; chevron rotates on open |
| Auth pages | Split-screen with full-height marketing panel, input icons, show/hide password |

**Dark mode** is persisted in `localStorage` and toggled from the Navbar moon/sun button. Every component — sidebar, navbar, cards, forms, dropdowns, and the chat widget — fully supports dark mode.

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 19 | UI framework |
| React Router DOM 7 | SPA routing with role-based guards |
| Axios | HTTP client with JWT interceptor |
| Recharts | Analytics charts (area, bar, pie) |
| Tailwind CSS 3 | Utility-first responsive styling with `darkMode: 'class'` |
| Vite 8 | Build tool |

### Backend
| Library | Purpose |
|---|---|
| Express 4 | REST API server |
| pg (node-postgres) | PostgreSQL client with connection pooling |
| @supabase/supabase-js | File storage (payment screenshots, medical reports, profile pictures, QR codes) |
| groq-sdk | AI chat completions via Groq (Llama 3.3 70B) |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth (7-day tokens) |
| multer | In-memory multipart file parsing |
| express-validator | Request body/param validation |
| uuid | UUID generation for filenames |

### Infrastructure
| Service | Usage |
|---|---|
| Supabase | PostgreSQL database + `payments`, `reports`, `profiles`, `qrcodes` storage buckets |
| Vercel | Frontend (SPA) + Backend (serverless Node) deployment |
| Groq | AI inference — Llama 3.3 70B Versatile |

---

## Project Structure

```
doctor-hub/
├── screenshots/                     # All UI screenshots (used in this README)
├── backend/
│   ├── server.js                    # Express app + CORS + route registration + auto-migration
│   ├── vercel.json                  # Routes all requests → server.js
│   └── src/
│       ├── config/
│       │   ├── db.js                # pg Pool — supports DATABASE_URL (Supabase pooler) + local
│       │   ├── migrate.js           # Full schema DDL migration
│       │   ├── seed.js              # Demo user/doctor/clinic/schedule seeder
│       │   └── storage.js           # Supabase Storage: uploadToStorage / deleteFromStorage
│       ├── controllers/
│       │   ├── adminController.js   # Stats, user management, doctor verification
│       │   ├── appointmentController.js
│       │   ├── authController.js    # Register, login, forgot password
│       │   ├── chatController.js    # AI chat — Groq + intent detection + platform data
│       │   ├── doctorController.js  # Profile, clinics, schedules, diseases, slots, payment info
│       │   ├── historyController.js # Medical history + prescriptions
│       │   ├── messageController.js # Send, conversations, thread, contacts
│       │   ├── paymentController.js # Upload screenshot, verify, reject
│       │   └── reportController.js  # Reports + notifications
│       ├── middleware/
│       │   ├── auth.js              # authenticate (JWT) + authorize(roles)
│       │   ├── errorHandler.js      # Global 500 handler
│       │   ├── upload.js            # multer memoryStorage instances
│       │   └── validate.js          # express-validator result formatter
│       ├── routes/
│       │   ├── admin.js
│       │   ├── appointments.js
│       │   ├── auth.js
│       │   ├── chat.js              # POST /chat/message
│       │   ├── doctors.js
│       │   ├── history.js
│       │   ├── messages.js
│       │   ├── payments.js
│       │   └── reports.js           # Also handles GET/PATCH /notifications
│       └── utils/
│           └── response.js          # success(res, data) / error(res, msg, code)
│
└── frontend/
    ├── vercel.json                  # SPA fallback: all non-asset paths → index.html
    └── src/
        ├── App.jsx                  # All routes + AppLayout (sidebar open/close state)
        ├── api/axios.js             # Axios instance: base URL + Bearer token interceptor
        ├── components/
        │   ├── ChatWidget.jsx       # AI chat widget — voice, multilingual, quick chips
        │   ├── Icons.jsx            # 30+ Heroicons as React components
        │   ├── Navbar.jsx           # Notifications bell + user menu + dark mode toggle
        │   ├── Sidebar.jsx          # Desktop static + mobile slide-in drawer + role badges
        │   └── PrivateRoute.jsx     # Auth + role guard wrapper
        ├── context/
        │   ├── AuthContext.jsx      # Login, logout, user state, localStorage token
        │   └── ThemeContext.jsx     # Dark mode: persisted class toggle on <html>
        └── pages/
            ├── auth/                Login · Register · ForgotPassword
            ├── patient/             Dashboard · DoctorSearch · BookAppointment
            │                        MyAppointments · MedicalHistory · Reports
            │                        Prescriptions · Messages
            ├── doctor/              Dashboard · Appointments · Profile
            │                        PatientHistory · Messages
            ├── assistant/           Dashboard · Payments · Messages
            └── admin/               Dashboard · Users · DoctorVerification
                                     Clinics · Payments
```

---

## Database Schema

| Table | Description |
|---|---|
| `users` | All accounts — roles: `patient` `doctor` `assistant` `admin` `super_admin` |
| `patients` | Patient profile: DOB, gender, blood group, emergency contact |
| `doctors` | Doctor profile: specialization, fee, bio, `is_verified`, **profile_picture_url**, **hospital_name**, **hospital_address**, **bank_name**, **account_title**, **bank_account_number**, **jazzcash_number**, **easypaisa_number**, **qr_code_url** |
| `assistants` | Links one assistant user to one doctor |
| `clinics` | Clinic name, address, city, phone |
| `doctor_clinics` | Many-to-many: doctor ↔ clinic |
| `doctor_diseases` | Conditions a doctor treats — used for patient search filtering |
| `doctor_schedules` | Weekly slots per doctor per clinic (day, start, end, slot duration) |
| `appointments` | Booking record with status flow (see below) |
| `payments` | Payment screenshot for an appointment — `pending` / `verified` / `rejected` |
| `medical_history` | Immutable diagnosis + notes written by doctor after consultation |
| `prescriptions` | JSONB medicines array linked to a medical history record |
| `patient_reports` | Files uploaded by patients, stored in Supabase Storage |
| `messages` | Direct messages between patient and doctor |
| `notifications` | Per-user bell notifications — booking, payment, records, messages |

### Appointment Status Flow

```
Patient books appointment
         │
         ▼
      pending  ─────────────────────────────► cancelled
         │
         │  Patient uploads payment screenshot
         ▼
  payment_uploaded ──────────────────────► cancelled
         │
         │  Assistant / Admin verifies payment
         ▼
     confirmed ────────────────────────► cancelled
         │
         │  Doctor marks completed
         ▼
     completed
```

---

## API Reference

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create patient account |
| POST | `/login` | Public | Returns JWT + user object |
| POST | `/forgot-password` | Public | Reset password by email |

### Doctors `/api/doctors`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List verified doctors (search, filter, paginate) |
| GET | `/:id` | Public | Doctor detail incl. payment info |
| GET | `/:id/slots` | Public | Available time slots for a date |
| GET | `/profile/me` | Doctor | My full profile |
| PUT | `/profile` | Doctor | Update professional details + payment info |
| POST | `/profile/picture` | Doctor | Upload profile picture |
| POST | `/profile/qr` | Doctor | Upload QR code image |
| POST | `/diseases` | Doctor | Add treated condition |
| DELETE | `/diseases/:id` | Doctor | Remove treated condition |
| POST | `/clinics` | Doctor | Create + link new clinic |
| POST | `/clinics/link` | Doctor | Link existing clinic by ID |
| DELETE | `/clinics/:id` | Doctor | Unlink clinic |
| POST | `/schedules` | Doctor | Add weekly schedule |
| PATCH | `/schedules/:id/toggle` | Doctor | Toggle availability |
| DELETE | `/schedules/:id` | Doctor | Delete schedule |

### Appointments `/api/appointments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Book appointment |
| GET | `/` | All roles | Role-scoped list |
| GET | `/:id` | Role-scoped | Single appointment |
| PATCH | `/:id/cancel` | Patient/Admin | Cancel |
| PATCH | `/:id/complete` | Doctor | Mark completed |

### Payments `/api/payments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/:appointmentId/upload` | Patient | Upload screenshot |
| GET | `/` | Assistant/Admin | List payments |
| GET | `/:id` | Role-scoped | Single payment |
| PATCH | `/:id/verify` | Assistant/Admin | Verify → confirms appointment |
| PATCH | `/:id/reject` | Assistant/Admin | Reject with note |

### Chat `/api/chat`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/message` | All | Send message to AI; returns AI reply. Body: `{ message, history[] }` |

The chat endpoint:
- Detects intent (`list_doctors`, `my_appointments`, `my_prescriptions`, `my_reports`, `my_payments`, `list_clinics`) and fetches live DB data to inject as context
- Detects language (Urdu script / Roman Urdu / English) and instructs the model to reply in the same style
- Uses Groq `llama-3.3-70b-versatile` with a system prompt that includes the full Doctor Hub feature guide and emergency escalation rules

### Medical History `/api/history`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Doctor | Add history record |
| GET | `/` | Patient/Doctor/Admin | Role-scoped list |
| GET | `/:id` | Role-scoped | Single record |
| POST | `/:historyId/prescriptions` | Doctor | Add prescription |
| GET | `/:historyId/prescriptions` | Role-scoped | List prescriptions |

### Reports `/api/reports`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Upload report file |
| GET | `/` | Patient/Doctor/Admin | List reports |
| GET | `/:id` | Role-scoped | Report metadata |
| GET | `/:id/file` | Role-scoped | Download (redirects to signed URL) |
| DELETE | `/:id` | Patient/Admin | Delete report + storage file |
| GET | `/notifications` | All | User's notification list |
| PATCH | `/notifications/read` | All | Mark all as read |

### Messages `/api/messages`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/contacts` | Patient/Doctor | People you can message |
| GET | `/` | Patient/Doctor | All conversations |
| GET | `/:userId` | Patient/Doctor | Message thread (marks read) |
| POST | `/` | Patient/Doctor | Send a message |

### Admin `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform analytics |
| GET | `/users` | Admin | All users |
| PATCH | `/users/:id/toggle` | Admin | Activate / deactivate |
| GET | `/doctors` | Admin | Doctors with verification status |
| PATCH | `/doctors/:id/verify` | Admin | Verify doctor |
| PATCH | `/doctors/:id/reject` | Admin | Reject doctor |
| GET | `/clinics` | Admin | All clinics |

---

## Environment Variables

### `backend/.env`
```env
# Supabase Transaction Pooler — IPv4 compatible with Vercel
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Supabase Storage
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# AI Chat (Groq)
GROQ_API_KEY=your_groq_api_key_here

# CORS — your frontend domain
FRONTEND_URL=https://drhubbyzain.vercel.app

# Local dev only
PORT=5001
```

### `frontend/.env`
```env
# Production
VITE_API_URL=https://backend-alpha-six-11.vercel.app/api

# Local dev
# VITE_API_URL=http://localhost:5001/api
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local) **or** a Supabase project
- npm
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup
```bash
# 1. Install dependencies
cd backend  && npm install
cd ../frontend && npm install

# 2. Create .env files (see above)

# 3. Run migrations
cd backend && npm run migrate

# 4. Seed demo data
npm run seed

# 5. Start backend  (http://localhost:5001)
npm run dev

# 6. Start frontend  (http://localhost:5173)
cd ../frontend && npm run dev
```

---

## Deployment (Vercel)

### Backend
```bash
cd backend
npx vercel --prod
```

`vercel.json` (already committed):
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

Set these in Vercel Project Settings → Environment Variables:
`DATABASE_URL` · `JWT_SECRET` · `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `GROQ_API_KEY` · `FRONTEND_URL`

> **Auto-migration**: `server.js` runs `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ...` at module load time, so new columns are automatically created on every Vercel cold start — no manual migration step needed after the first deploy.

### Frontend
```bash
cd frontend
npx vercel --prod
```

`vercel.json` (already committed):
```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

Set: `VITE_API_URL` → your backend URL + `/api`

---

## Supabase Setup

1. Create a new Supabase project
2. Go to **Storage** → create **public** buckets: `payments`, `reports`, `profiles`, `qrcodes`
3. Use the **Transaction Pooler** connection string (not the direct connection) — found at:
   `Project Settings → Database → Connection string → Transaction pooler`
   ```
   postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
   ```
4. Run `npm run migrate` to create all tables
5. Run `npm run seed` to populate demo data

---

## Role-Based Access

| Action | Patient | Doctor | Assistant | Admin |
|---|:---:|:---:|:---:|:---:|
| Search doctors & book appointments | ✅ | | | |
| View doctor profile picture & payment info | ✅ | | | |
| Upload payment screenshots | ✅ | | | |
| View own medical history & prescriptions | ✅ | | | |
| Add medical history + prescriptions | | ✅ | | |
| Manage clinics & schedules | | ✅ | | |
| Upload profile picture & payment details | | ✅ | | |
| Verify / reject payments | | | ✅ | ✅ |
| Verify doctor registrations | | | | ✅ |
| Manage all users | | | | ✅ |
| View platform analytics | | | | ✅ |
| Message appointment contacts | ✅ | ✅ | | |
| Use AI chat assistant | ✅ | ✅ | ✅ | ✅ |

---

## Notification Events

| Trigger | Recipient |
|---|---|
| Patient books appointment | Doctor |
| Payment verified | Patient |
| Payment rejected (with reason) | Patient |
| Doctor adds medical record | Patient |
| New message received | Message recipient |

---

## Recent Enhancements

### Doctor Payment & Profile Display
- Doctors can now upload a **profile picture** and a **QR code** for payments via their Profile page
- Doctors set **bank name, account title, account number, JazzCash number, EasyPaisa number** in their profile
- Patients see all of this on the **My Appointments** page next to each booking — no need to call the clinic to ask for payment details
- Doctor profile picture appears on **Find Doctors** search cards and the **Book Appointment** page

### Doctor Hub AI Chat Assistant
- Brand-new floating chat widget with a custom medical cross + EKG icon
- Pill-shaped FAB with animated online status dot
- Fully multilingual: Urdu script, Roman Urdu (auto-detected), English
- Live data queries: appointments, prescriptions, doctor list, payments, clinics
- Complete platform guide baked into the system prompt
- Voice input with full iOS Safari compatibility

### iOS Safari Voice Fixes
- Fixed **"service not allowed"** error: `startListening()` is now fully synchronous — no `await` before `recognition.start()` which broke the iOS user-gesture chain
- Fixed **iPad detection**: added `navigator.maxTouchPoints > 1` check for iPad iOS 13+ which reports `MacIntel` platform
- Fixed **`ur-PK` not supported on iOS**: silently falls back to `en-US` and shows a hint to speak in Roman Urdu

### UI / UX Redesign
- Complete visual overhaul across every page: auth, sidebar, navbar, patient/doctor/assistant/admin portals
- Inter font, blue→indigo gradient brand colour, frosted-glass effects, smooth CSS animations
- Full **dark mode** support persisted across sessions
- Responsive — optimised for mobile, tablet, and desktop

### "Dr. Dr." Double-Prefix Fix
- Doctor names stored in the DB already include "Dr." — removed all hardcoded `Dr.` prefixes from JSX across 11 files
- Doctor dashboard greeting strips the prefix with a regex before using the first name
