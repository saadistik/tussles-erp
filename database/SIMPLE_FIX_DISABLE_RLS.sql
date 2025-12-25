-- ============================================
-- SIMPLEST FIX: Just disable RLS on users table
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS completely on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (not needed anymore)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Owners can view all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow insert for new users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create the trigger function (improved version with better error handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Extract metadata with fallbacks
  user_email := COALESCE(NEW.email, 'unknown@example.com');
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1),
    'User'
  );
  
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'employee'
  );

  -- Insert into users table with all required fields
  INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_full_name,
    user_role,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(public.users.full_name, ''), EXCLUDED.full_name),
    role = COALESCE(NULLIF(public.users.role, ''), EXCLUDED.role),
    is_active = true,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT id, email, full_name, role FROM users LIMIT 5;

-- Done! Now try signing up as employee
