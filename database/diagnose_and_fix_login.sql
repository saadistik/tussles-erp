-- ============================================
-- DIAGNOSE LOGIN ISSUES
-- Run this to see what accounts exist and fix them
-- ============================================

-- STEP 1: Check all auth users
SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- STEP 2: Check all users in your public.users table
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- STEP 3: Find auth users that DON'T have entries in public.users
SELECT 
  au.id,
  au.email,
  au.created_at,
  'MISSING FROM public.users' as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- STEP 4: Fix ALL existing auth users by creating their public.users records
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'employee'),
  true
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Fix any users with NULL or empty roles
UPDATE public.users
SET role = 'employee'
WHERE role IS NULL OR role = '';

-- STEP 6: Make the FIRST user an owner (change this email to your actual email!)
UPDATE public.users
SET role = 'owner'
WHERE email = (
  SELECT email 
  FROM public.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- OR set a specific email as owner:
-- UPDATE public.users
-- SET role = 'owner'
-- WHERE email = 'your-actual-email@example.com';

-- STEP 7: Verify everything is fixed
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  au.last_sign_in_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- RESULT: You should now be able to login with any email from auth.users
-- Use the email and password you originally signed up with!