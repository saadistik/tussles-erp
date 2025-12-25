-- ============================================
-- QUICK FIX: Delete old record and create correct one
-- Run in Supabase SQL Editor
-- ============================================

-- Step 1: Delete any existing user with this email
DELETE FROM public.users WHERE email = 'shadowdell5566@gmail.com';

-- Step 2: Insert the correct user record with the right UUID
INSERT INTO public.users (id, email, full_name, role, is_active, created_at)
VALUES (
  '03afb952-52f4-4e13-b66d-c8eee9718610',
  'shadowdell5566@gmail.com',
  'Employee User',
  'employee',
  true,
  NOW()
);

-- Step 3: Verify it worked
SELECT id, email, full_name, role, is_active 
FROM public.users 
WHERE id = '03afb952-52f4-4e13-b66d-c8eee9718610';

-- You should see ONE record with:
-- - id: 03afb952-52f4-4e13-b66d-c8eee9718610
-- - email: shadowdell5566@gmail.com
-- - role: employee
-- 
-- Now refresh the browser and login!
