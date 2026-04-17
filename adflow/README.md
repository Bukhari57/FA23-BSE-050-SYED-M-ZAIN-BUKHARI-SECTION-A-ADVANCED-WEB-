# AdFlow Pro

Production-grade sponsored listing marketplace built with Next.js App Router, TypeScript, Tailwind CSS, ShadCN-style UI, Supabase PostgreSQL, and Supabase Auth.

## Key Features

- Strict ad lifecycle: `Draft -> Submitted -> Under Review -> Payment Pending -> Payment Submitted -> Payment Verified -> Scheduled -> Published -> Expired`
- RBAC dashboards: Client, Moderator, Admin, Super Admin
- Public marketplace pages: landing, explore, ad details, category, city, packages
- REST APIs for ads, moderation, payments, analytics, auth profile, and health
- Manual payment verification with duplicate transaction prevention
- URL-based media normalization for image URLs and YouTube thumbnails
- Ranking algorithm using featured flags, package weight, freshness, and boost score
- Cron routes for scheduled publishing, ad expiry, and health logs
- Zod validation + input sanitization + Supabase RLS policies

## Architecture

- `app/`: App Router pages and API route handlers
- `components/`: UI and charts
- `features/`: Zod schemas and feature contracts
- `controllers/`: API orchestration logic
- `services/`: business logic (ranking, analytics, marketplace, guards)
- `cron/`: cron authorization and jobs
- `lib/`: shared helpers (auth, Supabase clients, media, pagination, sanitize)
- `supabase/migrations/`: SQL migration scripts
- `db/`: schema and seed SQL

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env.local
```

3. Run dev server
```bash
npm run dev
```

4. Apply SQL migration/seed in Supabase SQL editor
- `supabase/migrations/20260417070000_init.sql`
- `db/seed.sql`

## Deployment (Vercel)

- Add env vars from `.env.example`
- Ensure cron requests include `x-cron-secret` (or `Authorization: Bearer <CRON_SECRET>`)
- Deploy via Vercel; scheduled jobs are defined in `vercel.json`

## Optional Enhancements Included in Schema

- `bookmarks`
- `abuse_reports`
- `notifications`
- `users.is_seller_verified`
