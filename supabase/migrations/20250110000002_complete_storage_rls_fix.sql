-- ============================================================================
-- COMPLETE STORAGE RLS FIX - All policies with auth.uid()
-- This migration replaces all previous storage RLS policies
-- ============================================================================

-- Drop ALL existing storage policies (idempotent)
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete agent avatars" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can view property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property documents" ON storage.objects;

-- ============================================================================
-- PROPERTY-IMAGES BUCKET (Public - Anyone can view, Authenticated can modify)
-- ============================================================================

-- SELECT: Anyone can view property images (public bucket)
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- INSERT: Authenticated users can upload property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update property images
CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete property images
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- AGENT-AVATARS BUCKET (Public - Anyone can view, Authenticated can modify)
-- ============================================================================

-- SELECT: Anyone can view agent avatars (public bucket)
CREATE POLICY "Anyone can view agent avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-avatars');

-- INSERT: Authenticated users can upload agent avatars
CREATE POLICY "Authenticated users can upload agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update agent avatars
CREATE POLICY "Authenticated users can update agent avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete agent avatars
CREATE POLICY "Authenticated users can delete agent avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- PROPERTY-DOCUMENTS BUCKET (Private - Only authenticated users)
-- ============================================================================

-- SELECT: Authenticated users can view property documents (private bucket)
CREATE POLICY "Authenticated users can view property documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- INSERT: Authenticated users can upload property documents
CREATE POLICY "Authenticated users can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update property documents
CREATE POLICY "Authenticated users can update property documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

-- DELETE: Authenticated users can delete property documents
CREATE POLICY "Authenticated users can delete property documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

