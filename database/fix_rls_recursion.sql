-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- Run this to disable problematic RLS policies
-- ============================================

-- QUICK FIX: Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Owners can read all users" ON users;
DROP POLICY IF EXISTS "Owners can update users" ON users;

-- Create new SIMPLE policies that don't cause recursion
-- Policy 1: All authenticated users can read their own profile
CREATE POLICY "users_select_own" ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: All authenticated users can read all user profiles (needed for app to work)
CREATE POLICY "users_select_all" ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own" ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- Test query - this should work now without recursion
SELECT id, email, full_name, role FROM users LIMIT 5;
