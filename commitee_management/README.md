# Committee Management System

A lean Angular + Supabase app for rotating savings committees. It includes auth, profiles, committee creation, join requests, member management, payment tracking, notifications, reputation scoring, and an admin overview.

## Screenshots


<img width="1440" height="900" alt="Screenshot 2026-05-12 at 2 23 56 PM" src="https://github.com/user-attachments/assets/771b0548-e07a-4682-9198-9c717f0fec51" />


<img width="1440" height="900" alt="Screenshot 2026-05-13 at 7 43 37 PM" src="https://github.com/user-attachments/assets/1858b2c0-6914-49e3-b4c8-ac113a687c29" />


<img width="1440" height="900" alt="Screenshot 2026-05-13 at 7 43 57 PM" src="https://github.com/user-attachments/assets/b34d2418-7139-4a5c-b43f-40cbf9cad706" />


<img width="1440" height="900" alt="Screenshot 2026-05-13 at 7 44 54 PM" src="https://github.com/user-attachments/assets/28b9ede7-95df-4dbc-a306-a75876da5188" />


<img width="1440" height="900" alt="Screenshot 2026-05-13 at 7 43 21 PM" src="https://github.com/user-attachments/assets/f5195589-9521-43bc-8511-50e0a53dddd9" />

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create a storage bucket named `payment-proofs`.
4. Copy `src/environments/environment.example.ts` to `src/environments/environment.ts` and fill in your Supabase URL and anon key.
5. Install and run:

```bash
npm start
```

## Vercel

Add these environment variables in Vercel:

- `NG_APP_SUPABASE_URL`
- `NG_APP_SUPABASE_ANON_KEY`

Then deploy normally. The included `vercel.json` handles Angular routing.
