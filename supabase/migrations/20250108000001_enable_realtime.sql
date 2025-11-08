-- ============================================================================
-- ENABLE REALTIME FOR ALL SPOTLIGHT TABLES
-- ============================================================================
-- This migration adds all Spotlight tables to the supabase_realtime publication
-- and sets REPLICA IDENTITY FULL for tables without primary keys.
-- ============================================================================

-- Add all tables to the realtime publication
-- Using DO block to make it idempotent (won't fail if already added)

DO $$
BEGIN
  -- Properties and related tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'properties'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'property_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.property_images;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'property_documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.property_documents;
  END IF;

  -- Leads and related tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lead_activity'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_activity;
  END IF;

  -- Viewings
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'viewings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.viewings;
  END IF;

  -- Offers and documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'offers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'offer_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.offer_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
  END IF;

  -- Saved searches and alerts
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'saved_searches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_searches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'alerts_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts_log;
  END IF;

  -- Syndication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'syndication_mappings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.syndication_mappings;
  END IF;

  -- Referrals
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'referrals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
  END IF;

  -- Analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'analytics_clicks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_clicks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'experiments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.experiments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'experiment_metrics'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.experiment_metrics;
  END IF;

  -- GDPR and compliance
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'consents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consents;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;

  -- Agents and regions
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'agents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'regions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.regions;
  END IF;

  -- Profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  -- Tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'task_templates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_templates;
  END IF;
END $$;

-- ============================================================================
-- SET REPLICA IDENTITY FULL for tables without primary keys
-- ============================================================================
-- This ensures realtime works even for tables without explicit PKs

-- Check and set REPLICA IDENTITY FULL where needed
-- Most tables have PKs, but we'll set FULL for safety on all tables

ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.property_images REPLICA IDENTITY FULL;
ALTER TABLE public.property_documents REPLICA IDENTITY FULL;
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.lead_activity REPLICA IDENTITY FULL;
ALTER TABLE public.viewings REPLICA IDENTITY FULL;
ALTER TABLE public.offers REPLICA IDENTITY FULL;
ALTER TABLE public.offer_events REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.saved_searches REPLICA IDENTITY FULL;
ALTER TABLE public.alerts_log REPLICA IDENTITY FULL;
ALTER TABLE public.syndication_mappings REPLICA IDENTITY FULL;
ALTER TABLE public.referrals REPLICA IDENTITY FULL;
ALTER TABLE public.analytics_clicks REPLICA IDENTITY FULL;
ALTER TABLE public.experiments REPLICA IDENTITY FULL;
ALTER TABLE public.experiment_metrics REPLICA IDENTITY FULL;
ALTER TABLE public.consents REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;
ALTER TABLE public.agents REPLICA IDENTITY FULL;
ALTER TABLE public.regions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_templates REPLICA IDENTITY FULL;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify all tables are in the publication:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;

-- ============================================================================
-- REALTIME ENABLED ✅
-- ============================================================================
-- All Spotlight tables are now subscribed to realtime updates.
-- Clients can now subscribe to changes using:
-- 
-- const channel = supabase
--   .channel('table-changes')
--   .on('postgres_changes', 
--     { event: '*', schema: 'public', table: 'properties' },
--     (payload) => console.log(payload)
--   )
--   .subscribe()
-- ============================================================================

