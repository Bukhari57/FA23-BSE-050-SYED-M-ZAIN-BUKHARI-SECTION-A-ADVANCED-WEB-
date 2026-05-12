# Committee Management System

A lean Angular + Supabase app for rotating savings committees. It includes auth, profiles, committee creation, join requests, member management, payment tracking, notifications, reputation scoring, and an admin overview.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create a storage bucket named `payment-proofs`.
4. Copy `src/environments/environment.example.ts` to `src/environments/environment.ts` and fill in your Supabase URL and anon key.
5. Install and run:

```bash
npm install
npm start
```

## Vercel

Add these environment variables in Vercel:

- `NG_APP_SUPABASE_URL`
- `NG_APP_SUPABASE_ANON_KEY`

Then deploy normally. The included `vercel.json` handles Angular routing.
