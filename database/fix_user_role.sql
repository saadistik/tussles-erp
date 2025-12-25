-- ============================================
-- Fix: Update Existing User Role
-- Run this in Supabase SQL Editor
-- ============================================

-- OPTION 1: Update your existing user to be an owner
UPDATE public.users 
SET role = 'owner', 
    full_name = 'Your Name Here',  -- Change this
    updated_at = NOW()
WHERE id = '10ef84ec-37ac-4838-9e2f-e56df7170813';

-- OPTION 2: Check all existing users first
SELECT id, email, full_name, role FROM public.users;

-- OPTION 3: If you want to change role for specific email
UPDATE public.users 
SET role = 'owner', 
    updated_at = NOW()
WHERE email = 'your@email.com';  -- Replace with your email

-- OPTION 4: Upsert (Insert or Update if exists)
INSERT INTO public.users (id, email, full_name, role)
VALUES ('10ef84ec-37ac-4838-9e2f-e56df7170813', 'your@email.com', 'Your Name', 'owner')
ON CONFLICT (id) 
DO UPDATE SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- ============================================
-- Verify the change
-- ============================================
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE id = '10ef84ec-37ac-4838-9e2f-e56df7170813';
