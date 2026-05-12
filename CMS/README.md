# Committee Management System

A lean Angular + Supabase app for rotating savings committees. It includes auth, profiles, committee creation, join requests, member management, payment tracking, notifications, reputation scoring, and an admin overview.

## Quick Start

Use Node.js 22 LTS for local development.

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Open http://localhost:4200/

## Setup from Scratch

1. Create a Supabase project at https://supabase.com
2. In Supabase SQL Editor, run `supabase/schema.sql`
3. Create a storage bucket named `payment-proofs`
4. Create `.env.local` with your credentials:
   ```
   NG_APP_SUPABASE_URL=https://your-project.supabase.co
   NG_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Run: `npm install && npm start`

## Demo & Testing

For quick testing with pre-populated data:

1. See [docs/DEMO_CREDENTIALS.md](docs/DEMO_CREDENTIALS.md) for test account info
2. Follow the SQL setup in [docs/SEED_SQL.sql](docs/SEED_SQL.sql)
3. Log in with demo credentials to explore features

**Demo Accounts** (after running seed SQL):
- **Admin**: admin@demo.local / AdminDemo123!
- **Members**: alice@demo.local, bob@demo.local, charlie@demo.local (all with "Demo123!" suffix)

## Architecture

- **Frontend**: Angular 18 (standalone components, lazy-loaded routes)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Auth**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Storage**: Supabase Storage for payment proofs

## Features

- 🔐 Email/password authentication
- 👥 Committee creation and membership
- 💰 Payment tracking with proof uploads
- ⭐ Trust score / reputation system
- 🔔 Real-time notifications
- 👨‍💼 Admin panel with user management
- 📱 Responsive design

## Build for Production

```bash
npm run build
```

Output goes to `dist/committee-management-system/`

## Deploy to Vercel

Add these environment variables in Vercel:

- `NG_APP_SUPABASE_URL`
- `NG_APP_SUPABASE_ANON_KEY`

Then deploy normally. The included `vercel.json` handles Angular routing.
