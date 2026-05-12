-- This SQL file sets up the Committee Management System database schema
-- and seeds it with demo data.
-- 
-- HOW TO USE:
-- 1. Go to your Supabase dashboard: https://app.supabase.com/
-- 2. Select your project: gdgzyjdsamesywragace
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste the contents of this file
-- 6. Click "Run"

-- ============================================================
-- STEP 1: Create enum types
-- ============================================================
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'confirmed');
CREATE TYPE member_status AS ENUM ('pending', 'approved', 'rejected', 'inactive');
CREATE TYPE committee_status AS ENUM ('open', 'active', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'payment_due',
  'member_joined',
  'turn_upcoming',
  'reputation_update',
  'payment_confirmed',
  'user_banned'
);

-- ============================================================
-- STEP 2: Create tables
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  trust_score INTEGER DEFAULT 50,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_id)
);

CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users (id),
  name TEXT NOT NULL,
  description TEXT,
  status committee_status DEFAULT 'open',
  duration_months INTEGER NOT NULL,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  max_members INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status member_status DEFAULT 'pending',
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  turn_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(committee_id, user_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  status payment_status DEFAULT 'pending',
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reputation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STEP 3: Create views
-- ============================================================
CREATE OR REPLACE VIEW committee_listings AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.status,
  c.monthly_amount,
  c.max_members,
  COUNT(DISTINCT cm.id) as member_count,
  u.full_name as creator_name
FROM committees c
LEFT JOIN committee_members cm ON c.id = cm.committee_id
LEFT JOIN users u ON c.creator_id = u.id
GROUP BY c.id, u.id;

-- ============================================================
-- STEP 4: Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: Create RLS Policies
-- ============================================================

-- Users table policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users AS u2 
      WHERE u2.auth_id = auth.uid() AND u2.is_admin = TRUE
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Committees table policies
CREATE POLICY "Anyone can read public committees" ON committees
  FOR SELECT USING (TRUE);

CREATE POLICY "Only creators can update their committees" ON committees
  FOR UPDATE USING (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Authenticated users can create committees" ON committees
  FOR INSERT WITH CHECK (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Committee members table policies
CREATE POLICY "Users can read committee members" ON committee_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can join committees" ON committee_members
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their membership" ON committee_members
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Payments table policies
CREATE POLICY "Users can read their payments" ON payments
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Users can update their payments" ON payments
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Notifications table policies
CREATE POLICY "Users can read their notifications" ON notifications
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Reputation logs table policies
CREATE POLICY "Users can read reputation logs" ON reputation_logs
  FOR SELECT USING (TRUE);

-- ============================================================
-- STEP 6: Create indexes
-- ============================================================
CREATE INDEX idx_users_auth_id ON users (auth_id);
CREATE INDEX idx_committees_creator_id ON committees (creator_id);
CREATE INDEX idx_committee_members_committee_id ON committee_members (committee_id);
CREATE INDEX idx_committee_members_user_id ON committee_members (user_id);
CREATE INDEX idx_payments_committee_id ON payments (committee_id);
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_reputation_logs_user_id ON reputation_logs (user_id);

-- ============================================================
-- STEP 7: Seed demo data
-- ============================================================

-- First, sync auth users with the users table
-- Get the admin user ID from auth.users
DO $$
DECLARE
  admin_auth_id UUID;
  alice_auth_id UUID;
  bob_auth_id UUID;
  charlie_auth_id UUID;
  admin_user_id UUID;
  alice_user_id UUID;
  bob_user_id UUID;
  charlie_user_id UUID;
  committee1_id UUID;
  committee2_id UUID;
  committee3_id UUID;
BEGIN
  -- Get auth user IDs
  SELECT id INTO admin_auth_id FROM auth.users WHERE email = 'admin@demo.local' LIMIT 1;
  SELECT id INTO alice_auth_id FROM auth.users WHERE email = 'alice@demo.local' LIMIT 1;
  SELECT id INTO bob_auth_id FROM auth.users WHERE email = 'bob@demo.local' LIMIT 1;
  SELECT id INTO charlie_auth_id FROM auth.users WHERE email = 'charlie@demo.local' LIMIT 1;

  -- Insert or update user profiles
  INSERT INTO users (auth_id, email, full_name, trust_score, is_admin)
  VALUES 
    (admin_auth_id, 'admin@demo.local', 'Admin User', 100, TRUE),
    (alice_auth_id, 'alice@demo.local', 'Alice Johnson', 85, FALSE),
    (bob_auth_id, 'bob@demo.local', 'Bob Smith', 80, FALSE),
    (charlie_auth_id, 'charlie@demo.local', 'Charlie Brown', 75, FALSE)
  ON CONFLICT (auth_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    trust_score = EXCLUDED.trust_score,
    is_admin = EXCLUDED.is_admin;

  -- Get the user IDs we just inserted
  SELECT id INTO admin_user_id FROM users WHERE auth_id = admin_auth_id;
  SELECT id INTO alice_user_id FROM users WHERE auth_id = alice_auth_id;
  SELECT id INTO bob_user_id FROM users WHERE auth_id = bob_auth_id;
  SELECT id INTO charlie_user_id FROM users WHERE auth_id = charlie_auth_id;

  -- Create demo committees (if they don't already exist)
  INSERT INTO committees (creator_id, name, description, status, duration_months, monthly_amount, max_members, start_date)
  SELECT admin_user_id, 'Monthly Savings Circle', 'A rotating savings group focused on monthly contributions.', 'active'::committee_status, 12, 100, 5, NOW() - INTERVAL '30 days'
  WHERE NOT EXISTS (SELECT 1 FROM committees WHERE name = 'Monthly Savings Circle');

  INSERT INTO committees (creator_id, name, description, status, duration_months, monthly_amount, max_members, start_date)
  SELECT admin_user_id, 'Education Fund Committee', 'Dedicated to saving for educational expenses and scholarships.', 'open'::committee_status, 6, 150, 4, NOW()
  WHERE NOT EXISTS (SELECT 1 FROM committees WHERE name = 'Education Fund Committee');

  INSERT INTO committees (creator_id, name, description, status, duration_months, monthly_amount, max_members, start_date)
  SELECT admin_user_id, 'Community Development', 'Building infrastructure and community projects together.', 'open'::committee_status, 3, 200, 8, NOW() + INTERVAL '7 days'
  WHERE NOT EXISTS (SELECT 1 FROM committees WHERE name = 'Community Development');

  -- Get committee IDs
  SELECT id INTO committee1_id FROM committees WHERE name = 'Monthly Savings Circle' LIMIT 1;
  SELECT id INTO committee2_id FROM committees WHERE name = 'Education Fund Committee' LIMIT 1;
  SELECT id INTO committee3_id FROM committees WHERE name = 'Community Development' LIMIT 1;

  -- Add members to committees (skip if already exist)
  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee1_id, alice_user_id, 'approved'::member_status, 1
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee1_id AND user_id = alice_user_id);

  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee1_id, bob_user_id, 'pending'::member_status, 2
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee1_id AND user_id = bob_user_id);

  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee2_id, alice_user_id, 'approved'::member_status, 1
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee2_id AND user_id = alice_user_id);

  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee2_id, charlie_user_id, 'pending'::member_status, 2
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee2_id AND user_id = charlie_user_id);

  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee3_id, bob_user_id, 'approved'::member_status, 1
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee3_id AND user_id = bob_user_id);

  INSERT INTO committee_members (committee_id, user_id, status, turn_position)
  SELECT committee3_id, charlie_user_id, 'approved'::member_status, 2
  WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE committee_id = committee3_id AND user_id = charlie_user_id);

  -- Create sample payments (skip if already exist)
  INSERT INTO payments (committee_id, user_id, amount, due_date, status, proof_url)
  SELECT committee1_id, alice_user_id, 100, NOW() + INTERVAL '7 days', 'paid'::payment_status, 'https://via.placeholder.com/150?text=Payment+Proof'
  WHERE NOT EXISTS (SELECT 1 FROM payments WHERE committee_id = committee1_id AND user_id = alice_user_id AND amount = 100);

  INSERT INTO payments (committee_id, user_id, amount, due_date, status, proof_url)
  SELECT committee1_id, bob_user_id, 100, NOW() + INTERVAL '14 days', 'pending'::payment_status, NULL
  WHERE NOT EXISTS (SELECT 1 FROM payments WHERE committee_id = committee1_id AND user_id = bob_user_id AND amount = 100);

  INSERT INTO payments (committee_id, user_id, amount, due_date, status, proof_url)
  SELECT committee2_id, alice_user_id, 150, NOW() + INTERVAL '5 days', 'confirmed'::payment_status, 'https://via.placeholder.com/150?text=Payment+Proof'
  WHERE NOT EXISTS (SELECT 1 FROM payments WHERE committee_id = committee2_id AND user_id = alice_user_id AND amount = 150);

  INSERT INTO payments (committee_id, user_id, amount, due_date, status, proof_url)
  SELECT committee3_id, bob_user_id, 200, NOW() + INTERVAL '10 days', 'pending'::payment_status, NULL
  WHERE NOT EXISTS (SELECT 1 FROM payments WHERE committee_id = committee3_id AND user_id = bob_user_id AND amount = 200);

  -- Create sample notifications (skip if already exist)
  INSERT INTO notifications (user_id, type, title, message, read)
  SELECT alice_user_id, 'payment_due'::notification_type, 'Payment Due', 'Your monthly payment is due in 3 days', FALSE
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = alice_user_id AND type = 'payment_due'::notification_type AND title = 'Payment Due');

  INSERT INTO notifications (user_id, type, title, message, read)
  SELECT bob_user_id, 'member_joined'::notification_type, 'New Member', 'Alice has joined your committee', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = bob_user_id AND type = 'member_joined'::notification_type AND title = 'New Member');

  INSERT INTO notifications (user_id, type, title, message, read)
  SELECT charlie_user_id, 'turn_upcoming'::notification_type, 'Your Turn', 'It will be your turn to receive funds in 2 weeks', FALSE
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = charlie_user_id AND type = 'turn_upcoming'::notification_type AND title = 'Your Turn');

  INSERT INTO notifications (user_id, type, title, message, read)
  SELECT alice_user_id, 'reputation_update'::notification_type, 'Trust Score Updated', 'Your trust score has improved by 5 points', TRUE
  WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id = alice_user_id AND type = 'reputation_update'::notification_type AND title = 'Trust Score Updated');

  -- Create reputation logs (skip if already exist)
  INSERT INTO reputation_logs (user_id, action, delta, reason)
  SELECT alice_user_id, 'payment_confirmed', 10, 'Bonus for on-time payment'
  WHERE NOT EXISTS (SELECT 1 FROM reputation_logs WHERE user_id = alice_user_id AND action = 'payment_confirmed' AND delta = 10);

  INSERT INTO reputation_logs (user_id, action, delta, reason)
  SELECT bob_user_id, 'attendance', 5, 'Attended meeting'
  WHERE NOT EXISTS (SELECT 1 FROM reputation_logs WHERE user_id = bob_user_id AND action = 'attendance' AND delta = 5);

  INSERT INTO reputation_logs (user_id, action, delta, reason)
  SELECT charlie_user_id, 'leadership', 15, 'Led committee discussion'
  WHERE NOT EXISTS (SELECT 1 FROM reputation_logs WHERE user_id = charlie_user_id AND action = 'leadership' AND delta = 15);

  RAISE NOTICE 'Demo data seeded successfully!';
END $$;

-- ============================================================
-- Done! Your database is now ready to use.
-- ============================================================
