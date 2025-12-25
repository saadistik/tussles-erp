-- ============================================
-- Setup Users in public.users table
-- Run this in Supabase SQL Editor
-- ============================================

-- First, create a trigger to auto-populate users table when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Create test users (replace with actual Auth UIDs)
-- ============================================

-- STEP 1: Sign up these users in Supabase Authentication first:
-- 1. Go to Supabase Dashboard > Authentication > Users > Add User
-- 2. Create employee@tussles.com with password
-- 3. Create owner@tussles.com with password
-- 4. Copy their Auth UIDs and replace below

-- STEP 2: Run this query to get existing auth users and their IDs:
SELECT id, email, created_at FROM auth.users;

-- STEP 3: Insert into public.users table (replace UUIDs with actual ones from Step 2)
-- Example:
-- INSERT INTO public.users (id, email, full_name, role) VALUES
-- ('PASTE-AUTH-UUID-HERE', 'employee@tussles.com', 'Test Employee', 'employee'),
-- ('PASTE-AUTH-UUID-HERE', 'owner@tussles.com', 'Test Owner', 'owner');

-- ============================================
-- QUICK FIX: If you're already logged in
-- ============================================
-- Run this to see your current auth user ID:
SELECT auth.uid() as my_user_id, auth.email() as my_email;

-- Then insert yourself as an owner:
-- INSERT INTO public.users (id, email, full_name, role) VALUES
-- (auth.uid(), auth.email(), 'Your Name', 'owner');
