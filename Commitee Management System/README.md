# Committee Manager Plus

Modern full-stack Committee Management System with Angular frontend and Node.js/Express backend, built for production-grade committee operations.

## Stack

Frontend:
- Angular standalone architecture (Angular 19-compatible patterns, running on current workspace Angular)
- Angular Material + Tailwind CSS
- RxJS + Angular Signals
- Chart.js visualizations
- Responsive SaaS-style UI with light/dark mode

Backend:
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT auth + refresh tokens
- RBAC authorization
- Socket.IO real-time channel

## Key Features

- Authentication: register/login/forgot/reset/verify email/refresh/me/logout
- Dashboard analytics with stat cards, trend chart, transactions, notifications
- Committee management with filtering, status, payout rotation
- Member management with profile and payment history plumbing
- Payment installment tracking with late fine calculation
- Admin panel: users + committee approval + audit logs
- Reports: generate and download PDF/Excel summaries
- Settings: profile/security/notification preferences
- Landing page with premium SaaS visual style
- Seed script for realistic demo data

## Project Structure

```text
.
├── src/                         # Angular frontend
│   └── app/
│       ├── core/                # guards, interceptors, services, models, state
│       ├── shared/              # reusable UI components
│       ├── features/            # route-level pages
│       └── layouts/             # app shell/layouts
├── server/                      # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── sockets/
│   ├── scripts/seed.ts
│   └── docs/api.md
└── docker-compose.yml
```

## Local Setup

### 1) Install dependencies

```bash
npm install
cd server && npm install
```

### 2) Configure environment

```bash
cp server/.env.example server/.env
```

Update `server/.env` values (Mongo URI + JWT secrets + SMTP).

### 3) Run app

```bash
npm run dev
```

Frontend: `http://localhost:4200`
Backend: `http://localhost:5000/api`

The frontend API URL is runtime-configurable via `public/runtime-config.js`.
Default value is `/api`:
- In local dev, Angular proxies `/api` to `http://localhost:5000` using `proxy.conf.json`.
- In Docker, Nginx proxies `/api` and `/socket.io` to the backend service.

### 3.1) Configure Supabase (for member profile image uploads)

Update frontend environment values:

- [`src/environments/environment.ts`](/Users/laptopzone/Documents/GitHub/FA23-BSE-050-SYED-M-ZAIN-BUKHARI-SECTION-A-ADVANCED-WEB-/Commitee%20Management%20System/src/environments/environment.ts)
- [`src/environments/environment.prod.ts`](/Users/laptopzone/Documents/GitHub/FA23-BSE-050-SYED-M-ZAIN-BUKHARI-SECTION-A-ADVANCED-WEB-/Commitee%20Management%20System/src/environments/environment.prod.ts)

Required values:
- `supabaseUrl`
- `supabaseAnonKey`
- `supabaseProfileBucket` (default: `member-profiles`)

In Supabase:
- Create storage bucket `member-profiles`.
- Add storage policy to allow authenticated or public upload/read according to your app security model.

### 4) Seed demo data

```bash
npm run seed
```

Default seeded users:
- `admin@committeeplus.app` / `Admin1234!`
- `manager@committeeplus.app` / `Manager1234!`

## API Documentation

- API overview: [`server/docs/api.md`](server/docs/api.md)
- Health endpoint: `GET /api/health`

## Build

```bash
npm run build:all
```

## Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017`
- Runtime API URL can be changed with frontend env var `API_BASE_URL` (default `/api`).

## Deployment Guide

### Frontend (Vercel)
- Framework preset: Angular
- Build command: `npm run build:frontend`
- Output directory: `dist/committee-management-system/browser`
- If you are not using a same-origin reverse proxy, set `window.__COMMITTEE_CONFIG__.apiBaseUrl` in `runtime-config.js` to your backend URL.

### Backend (Render/Railway)
- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment variables: use `server/.env.example` as checklist

### Database (MongoDB Atlas)
- Create cluster and DB user
- Add network access rules
- Use Atlas URI in `MONGO_URI`

## Security Notes

- Strong JWT secrets required in production
- Enable SMTP for verification/reset emails
- Use HTTPS-only deployment
- Consider storing uploads in S3/Cloudinary (instead of in-memory/base64)

## PWA/Offline Baseline

- `public/manifest.webmanifest` added
- App is installable-ready; extend with Angular service worker (`ng add @angular/pwa`) for full offline caching policy

## What to Build Next

1. Add route-level unit tests and integration tests (frontend + backend).
2. Replace demo avatar upload with cloud object storage.
3. Add per-committee role assignments and invitation workflow.
4. Add advanced report templates and scheduled report emails.
