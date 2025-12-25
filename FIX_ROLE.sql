-- ============================================
-- STEP-BY-STEP FIX: Set Your Account as Owner
-- Run in Supabase SQL Editor
-- ============================================

-- STEP 1: Get all Auth users (find your email and copy the ID)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- STEP 2: Replace 'PASTE-YOUR-UUID-HERE' with your actual UUID from Step 1
-- Replace 'your@email.com' with your actual email
UPDATE public.users 
SET role = 'owner', 
    full_name = 'Owner Name',
    updated_at = NOW()
WHERE id = 'PASTE-YOUR-UUID-HERE';

-- If the UPDATE above returns 0 rows, use INSERT instead:
INSERT INTO public.users (id, email, full_name, role)
VALUES ('PASTE-YOUR-UUID-HERE', 'your@email.com', 'Owner Name', 'owner');

-- STEP 3: Verify it worked
SELECT id, email, full_name, role FROM public.users;
