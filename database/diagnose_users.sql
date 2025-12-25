-- ============================================
-- DIAGNOSTIC: Check and fix employee accounts
-- Run in Supabase SQL Editor
-- ============================================

-- Step 1: Check auth.users (should show your employee account)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name' as full_name_from_metadata,
  raw_user_meta_data->>'role' as role_from_metadata,
  email_confirmed_at, 
  created_at 
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check public.users (should match auth.users)
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  is_active, 
  created_at 
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Find orphaned auth users (in auth but not in public.users)
SELECT 
  au.id, 
  au.email, 
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 4: Fix orphaned users - manually create public.users records
-- Copy one of the IDs from Step 3 and run this:
-- REPLACE 'USER-ID-HERE' and 'email@example.com' with actual values
/*
INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
SELECT 
  id, 
  email,
  COALESCE(raw_user_meta_data->>'full_name', email, 'Employee'),
  'employee',
  true,
  created_at
FROM auth.users
WHERE id = 'USER-ID-HERE'
ON CONFLICT (id) DO NOTHING;
*/

-- Step 5: Fix all orphaned users at once
INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
SELECT 
  au.id, 
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Employee'),
  COALESCE(au.raw_user_meta_data->>'role', 'employee'),
  true,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Step 6: Update any users with NULL or empty role
UPDATE public.users 
SET 
  role = 'employee',
  is_active = true,
  full_name = COALESCE(full_name, email, 'Employee')
WHERE role IS NULL OR role = '' OR full_name IS NULL;

-- Step 7: Verify everything is fixed
SELECT 
  u.id, 
  u.email, 
  u.full_name, 
  u.role, 
  u.is_active,
  CASE 
    WHEN u.role IS NULL THEN '❌ NO ROLE'
    WHEN u.role = 'employee' THEN '✅ EMPLOYEE'
    WHEN u.role = 'owner' THEN '👑 OWNER'
    ELSE '⚠️ ' || u.role
  END as status
FROM public.users u
ORDER BY u.created_at DESC;
