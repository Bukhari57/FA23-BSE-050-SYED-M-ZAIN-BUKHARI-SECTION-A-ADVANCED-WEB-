-- Additional RLS Policy needed for signup
-- Run this in Supabase SQL Editor

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);
