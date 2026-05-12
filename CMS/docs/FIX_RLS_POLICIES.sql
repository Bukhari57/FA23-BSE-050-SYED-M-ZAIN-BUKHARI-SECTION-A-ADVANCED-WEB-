-- Fixed RLS Policies (no infinite recursion)
-- Run this in Supabase SQL Editor after deleting all policies

-- ============================================================
-- Users table policies (FIXED - no recursion)
-- ============================================================
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- ============================================================
-- Committees table policies
-- ============================================================
CREATE POLICY "Anyone can read public committees" ON committees
  FOR SELECT USING (TRUE);

CREATE POLICY "Only creators can update their committees" ON committees
  FOR UPDATE USING (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Authenticated users can create committees" ON committees
  FOR INSERT WITH CHECK (creator_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================
-- Committee members table policies
-- ============================================================
CREATE POLICY "Users can read committee members" ON committee_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can join committees" ON committee_members
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their membership" ON committee_members
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================
-- Payments table policies (FIXED - no infinite recursion on admin check)
-- ============================================================
CREATE POLICY "Users can read their payments" ON payments
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their payments" ON payments
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their payments" ON payments
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================
-- Notifications table policies
-- ============================================================
CREATE POLICY "Users can read their notifications" ON notifications
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================
-- Reputation logs table policies
-- ============================================================
CREATE POLICY "Users can read reputation logs" ON reputation_logs
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reputation logs" ON reputation_logs
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));
