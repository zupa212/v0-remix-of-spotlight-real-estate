-- Verification script for leads table migration
-- Run this in Supabase SQL Editor to verify the migration was successful

-- 1. Check if correct columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leads' 
  AND column_name IN ('full_name', 'lead_source', 'status', 'name', 'source', 'stage')
ORDER BY column_name;

-- Expected result: Should show full_name, lead_source, status
-- Should NOT show name, source, stage (old columns should be removed)

-- 2. Check if indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'leads' 
  AND indexname LIKE '%full_name%' OR indexname LIKE '%lead_source%';

-- 3. Check sample data (if any leads exist)
SELECT 
  id,
  full_name,
  email,
  lead_source,
  status,
  created_at
FROM public.leads
LIMIT 5;

-- 4. Verify constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.leads'::regclass
  AND (conname LIKE '%status%' OR conname LIKE '%lead_source%');

