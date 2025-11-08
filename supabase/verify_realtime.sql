-- ============================================================================
-- VERIFY REALTIME STATUS ON SUPABASE SERVER
-- ============================================================================
-- Run this in Supabase SQL Editor to check if Realtime is enabled
-- ============================================================================

-- 1. Check if supabase_realtime publication exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    THEN '✅ supabase_realtime publication EXISTS'
    ELSE '❌ supabase_realtime publication MISSING'
  END AS publication_status;

-- 2. List ALL tables in the realtime publication
SELECT 
  tablename,
  '✅ In Realtime' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;

-- 3. Count tables in realtime
SELECT 
  COUNT(*) AS total_tables_in_realtime,
  CASE 
    WHEN COUNT(*) >= 23 THEN '✅ All tables enabled'
    WHEN COUNT(*) > 0 THEN '⚠️ Some tables missing'
    ELSE '❌ No tables in realtime'
  END AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 4. Check REPLICA IDENTITY FULL status for key tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN relreplident = 'f' THEN '✅ REPLICA IDENTITY FULL'
    WHEN relreplident = 'd' THEN '⚠️ REPLICA IDENTITY DEFAULT'
    ELSE '❌ Other'
  END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND tablename IN (
    'properties', 'leads', 'viewings', 'offers', 'saved_searches',
    'property_images', 'property_documents', 'lead_activity',
    'offers', 'offer_events', 'documents', 'tasks'
  )
ORDER BY tablename;

-- 5. Expected tables list (for comparison)
SELECT 
  'Expected Tables:' AS info,
  ARRAY[
    'agents', 'alerts_log', 'analytics_clicks', 'audit_logs',
    'consents', 'documents', 'experiment_metrics', 'experiments',
    'lead_activity', 'leads', 'offer_events', 'offers',
    'profiles', 'property_documents', 'property_images', 'properties',
    'referrals', 'regions', 'saved_searches', 'syndication_mappings',
    'task_templates', 'tasks', 'viewings'
  ] AS expected_tables;

-- 6. Missing tables (if any)
SELECT 
  'Missing from Realtime:' AS info,
  ARRAY_AGG(tablename) AS missing_tables
FROM (
  SELECT unnest(ARRAY[
    'agents', 'alerts_log', 'analytics_clicks', 'audit_logs',
    'consents', 'documents', 'experiment_metrics', 'experiments',
    'lead_activity', 'leads', 'offer_events', 'offers',
    'profiles', 'property_documents', 'property_images', 'properties',
    'referrals', 'regions', 'saved_searches', 'syndication_mappings',
    'task_templates', 'tasks', 'viewings'
  ]) AS tablename
) expected
WHERE tablename NOT IN (
  SELECT tablename 
  FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime'
);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- If you see:
-- ✅ All tables in realtime = GOOD!
-- ⚠️ Some tables missing = Run the migration again
-- ❌ No tables = Run the migration NOW
-- ============================================================================

