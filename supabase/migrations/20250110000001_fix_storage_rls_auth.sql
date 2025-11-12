-- ============================================================================
-- FIX STORAGE RLS POLICIES - Use auth.uid() instead of auth.role()
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update agent avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete agent avatars" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property documents" ON storage.objects;

-- RLS Policies for property-images bucket (FIXED - Use auth.uid())
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- RLS Policies for agent-avatars bucket (FIXED - Use auth.uid())
CREATE POLICY "Authenticated users can upload agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update agent avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete agent avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'agent-avatars' AND auth.uid() IS NOT NULL);

-- RLS Policies for property-documents bucket (FIXED - Use auth.uid())
CREATE POLICY "Authenticated users can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update property documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete property documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-documents' AND auth.uid() IS NOT NULL);

