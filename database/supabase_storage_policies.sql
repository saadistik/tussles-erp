-- ============================================
-- SUPABASE STORAGE BUCKET SETUP
-- For Tussle Design Images
-- ============================================

-- Step 1: Create the storage bucket (run this in Supabase SQL Editor or use Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tussle-images', 'tussle-images', true);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload tussle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tussle-images' AND
    (storage.foldername(name))[1] = 'orders'
);

-- Policy 2: Allow public read access to tussle images
CREATE POLICY "Public can view tussle images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tussle-images');

-- Policy 3: Allow users to update their uploaded images
CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tussle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 4: Allow users to delete their uploaded images
CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tussle-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy 5: Owners can delete any image
CREATE POLICY "Owners can delete any tussle image"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'tussle-images' AND
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'owner'
    )
);

-- ============================================
-- ALTERNATIVE: Create bucket via Supabase Dashboard
-- ============================================
-- 1. Go to Storage section in Supabase Dashboard
-- 2. Click "New Bucket"
-- 3. Name: tussle-images
-- 4. Public bucket: Yes (for easier image viewing)
-- 5. Apply the policies above via SQL Editor

-- ============================================
-- FILE NAMING CONVENTION
-- ============================================
-- Suggested path structure: orders/{order_id}/{timestamp}_{filename}
-- Example: orders/550e8400-e29b-41d4-a716-446655440000/1703520000_design.jpg

-- ============================================
-- STORAGE LIMITS (Optional - Set via Dashboard)
-- ============================================
-- Allowed MIME types: image/jpeg, image/png, image/jpg, image/webp
-- Max file size: 5MB (5242880 bytes)
