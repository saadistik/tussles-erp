-- ============================================
-- Create Test Accounts (Owner & Employee)
-- Run this in Supabase SQL Editor
-- ============================================

-- TEST ACCOUNTS CREDENTIALS:
-- ============================================
-- OWNER ACCOUNT:
--   Email: owner@test.com
--   Password: Owner123!
--
-- EMPLOYEE ACCOUNT:
--   Email: employee@test.com
--   Password: Employee123!
-- ============================================

-- IMPORTANT: You cannot create auth users directly via SQL for security reasons.
-- Follow these steps:

-- STEP 1: Go to Supabase Dashboard
--   1. Click "Authentication" in the left sidebar
--   2. Click "Users" tab
--   3. Click "Add User" or "Invite User" button

-- STEP 2: Create Owner Account
--   Email: owner@test.com
--   Password: Owner123!
--   ☑ Auto Confirm User (check this box!)
--   Click "Create User"

-- STEP 3: Create Employee Account
--   Email: employee@test.com
--   Password: Employee123!
--   ☑ Auto Confirm User (check this box!)
--   Click "Create User"

-- STEP 4: Now run this SQL to set up their roles in the users table:

-- Create/Update owner account
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT 
  id, 
  email, 
  'Test Owner', 
  'owner', 
  true
FROM auth.users 
WHERE email = 'owner@test.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  full_name = 'Test Owner',
  is_active = true;

-- Create/Update employee account
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT 
  id, 
  email, 
  'Test Employee', 
  'employee', 
  true
FROM auth.users 
WHERE email = 'employee@test.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'employee',
  full_name = 'Test Employee',
  is_active = true;

-- STEP 5: Verify the accounts were created successfully
SELECT 
  u.email, 
  u.full_name, 
  u.role, 
  u.is_active,
  au.confirmed_at IS NOT NULL as email_confirmed
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('owner@test.com', 'employee@test.com')
ORDER BY u.role;

-- If you don't see any results, it means the auth users weren't created yet
-- Go back to STEP 1 and create them in the Supabase Dashboard
