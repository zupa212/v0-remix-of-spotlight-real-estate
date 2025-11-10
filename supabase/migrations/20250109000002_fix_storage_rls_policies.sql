-- ============================================================================
-- FIX STORAGE RLS POLICIES
-- This migration fixes RLS policies for storage buckets
-- ============================================================================

-- Drop existing policies if they exist (idempotent)
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

-- RLS Policies for property-images bucket
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- RLS Policies for agent-avatars bucket
CREATE POLICY "Anyone can view agent avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-avatars');

CREATE POLICY "Authenticated users can upload agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'agent-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update agent avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'agent-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete agent avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'agent-avatars' AND auth.role() = 'authenticated');

-- RLS Policies for property-documents bucket (private)
CREATE POLICY "Authenticated users can view property documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update property documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete property documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-documents' AND auth.role() = 'authenticated');

