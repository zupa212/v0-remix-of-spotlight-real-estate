-- Create storage buckets for images and documents
-- Note: This migration creates the buckets via SQL
-- In production, you may need to create them via Supabase Dashboard or API

-- Property Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Agent Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-avatars',
  'agent-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Property Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false, -- Private bucket
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage buckets are created in a separate migration
-- See: 20250109000002_fix_storage_rls_policies.sql

