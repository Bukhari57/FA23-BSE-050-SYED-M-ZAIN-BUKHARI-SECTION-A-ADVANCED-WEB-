# AdFlow Pro

A Next.js marketplace for moderated ads, payment verification, scheduling, and expiration.

## Features

- Role-based workflow: Client (User), Moderator, Admin, Super Admin, Public Viewer
- Ad lifecycle: Draft → Submitted → Under Review → Approved → Scheduled → Live → Expired
- Package-based ranking: Basic, Standard, Premium
- Payment verification simulation
- Moderator review with internal notes and suspicious media flagging
- Admin payment verification, feature control, ad scheduling, and user management
- Super Admin package and settings management, plus system-level reports
- API routes for auth, ads, moderation, admin, and packages
- Automation route for scheduled publishing and expiration

## Setup

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Configure Supabase and database settings using `.env` or copy `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Push schema to the configured database and seed initial data:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```
5. Run the app:
   ```bash
   npm run dev
   ```

## Supabase

- Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for frontend Supabase access
- Use `SUPABASE_SERVICE_ROLE_KEY` for server-side Supabase access
- Use `DATABASE_URL` to connect Prisma to your Supabase Postgres database
- Supabase client helpers are available in `lib/supabase.ts`

## Database

The database schema is defined in `prisma/schema.prisma`.

## Notes

- No file uploads are supported; only external media URLs.
- Use the `/api/cron/run` endpoint or `npm run cron` to trigger scheduled status updates.
