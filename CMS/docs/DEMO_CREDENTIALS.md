# Demo Credentials & Setup Guide

## Already Created Test Accounts

The following user accounts have been created in your Supabase project and are ready to use:

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.local` | `AdminDemo123!` | Admin |
| `alice@demo.local` | `AliceDemo123!` | Member |
| `bob@demo.local` | `BobDemo123!` | Member |
| `charlie@demo.local` | `CharlieDemo123!` | Member |

## Setup Instructions

### Step 1: Apply Database Schema (One-time Setup)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: **gdgzyjdsamesywragace**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** (or **New**)
5. Copy the entire contents of `docs/SEED_SQL.sql`
6. Paste it into the SQL editor
7. Click **Run**
8. Wait for the query to complete (you should see "Demo data seeded successfully!")

### Step 2: Start the Development Server

```bash
npm start
```

The app will be available at **http://localhost:4200/**

### Step 3: Test Login

1. Open http://localhost:4200/ in your browser
2. You'll see the login page
3. Log in with any of the demo credentials above
4. Try the admin account to see the admin panel

## What's Included in the Demo Data

After running the SQL script, your database will have:

- **4 Demo Users**: 1 admin + 3 regular members
- **3 Sample Committees**:
  - "Monthly Savings Circle" (Active, 12 months, $100/month)
  - "Education Fund Committee" (Open, 6 months, $150/month)
  - "Community Development" (Open, 3 months, $200/month)
- **Committee Memberships**: Members with approved and pending statuses
- **Sample Payments**: Mix of pending, paid, and confirmed payments
- **Notifications**: Demo notifications for testing real-time features
- **Reputation Logs**: Sample trust score entries

## Testing the App

### As a Regular Member
1. Log in with `alice@demo.local` / `AliceDemo123!`
2. View your dashboard with stats
3. Browse available committees
4. View your memberships and payment status
5. See notifications

### As an Admin
1. Log in with `admin@demo.local` / `AdminDemo123!`
2. Navigate to `/admin` to see:
   - System statistics
   - All users and their trust scores
   - Ban user functionality
   - Total revenue across committees

### Features to Test
- ✅ Authentication (login, logout)
- ✅ Committee browsing and joining
- ✅ Payment tracking
- ✅ Member management
- ✅ Trust score system
- ✅ Real-time notifications
- ✅ Admin dashboard and user management

## Troubleshooting

### App shows "Could not find the table 'public.committees'" error
- **Solution**: You need to run the SQL script from `docs/SEED_SQL.sql` in Supabase. The database schema hasn't been created yet.

### Cannot log in
- **Solution**: Make sure you've run the SQL script and your credentials exactly match what's listed above (case-sensitive for email)

### Tables don't exist error
- **Solution**: 
  1. Go to Supabase dashboard
  2. Click SQL Editor
  3. Check if any tables exist under "Schemas" > "public"
  4. If empty, run the SQL script from `docs/SEED_SQL.sql`

## Next Steps

Once you've verified everything works:

1. **Add More Test Data**: You can manually create more committees and members through the UI
2. **Test Payment Upload**: Try uploading payment proofs
3. **Admin Functions**: Test banning users from the admin panel
4. **Notifications**: Trigger notifications by updating membership or payment status

## Project URLs

- **App**: http://localhost:4200/
- **Supabase Dashboard**: https://app.supabase.com/
- **Supabase Project**: https://app.supabase.com/project/gdgzyjdsamesywragace

---

Generated: 2026-05-12  
Angular 18.2.0 + Supabase + Node 22 LTS
