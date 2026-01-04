-- ============================================
-- Fix Existing Users - Add Missing Roles & Trigger
-- Run this AFTER mrp_schema.sql if you have existing users
-- ============================================

-- PART 1: Create trigger to auto-create users table entries for new auth.users
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PART 2: Create users table entries for existing auth.users
-- ============================================

-- Insert records for auth users that don't exist in users table yet
INSERT INTO public.users (id, email, full_name, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'employee'),
  true
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- PART 3: Fix any users with NULL or empty role
-- ============================================

UPDATE users 
SET role = 'employee' 
WHERE role IS NULL OR role = '';

-- PART 4: Set your owner account
-- ============================================
-- IMPORTANT: Change this email to YOUR actual email!
UPDATE users 
SET role = 'owner' 
WHERE email = 'saadhassan.sadiq@gmail.com';

-- PART 5: Verify everything is set up correctly
-- ============================================

-- Check all users have roles now
SELECT id, email, full_name, role, is_active 
FROM users
ORDER BY created_at DESC;

-- Verify trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
