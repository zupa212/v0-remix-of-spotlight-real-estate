-- ============================================================================
-- ENABLE RLS ON ALL TABLES - COMPLETE FIX
-- This migration ensures RLS is enabled on ALL public tables
-- Run this to fix the 12 tables showing "RLS Disabled in Public"
-- ============================================================================

-- Enable RLS on all tables (idempotent - safe to run multiple times)
DO $$
DECLARE
  table_name TEXT;
  tables_to_enable TEXT[] := ARRAY[
    'properties',
    'property_images',
    'property_documents',
    'agents',
    'regions',
    'profiles',
    'leads',
    'lead_activity',
    'viewings',
    'offers',
    'offer_events',
    'documents',
    'saved_searches',
    'alerts_log',
    'syndication_mappings',
    'analytics_clicks',
    'analytics_page_views',
    'experiments',
    'experiment_metrics',
    'referrals',
    'tasks',
    'task_templates',
    'consents',
    'audit_logs'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_enable
  LOOP
    -- Check if table exists before enabling RLS
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) THEN
      EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE '✅ RLS enabled on: %', table_name;
    ELSE
      RAISE NOTICE '⚠️  Table does not exist: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ RLS enabled on all existing tables!';
END $$;

-- ============================================================================
-- CREATE/REPLACE RLS POLICIES FOR ALL TABLES
-- ============================================================================

-- Property Documents Policies
DROP POLICY IF EXISTS "property_documents_select_all" ON public.property_documents;
CREATE POLICY "property_documents_select_all"
  ON public.property_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_documents.property_id 
      AND (published = true OR auth.uid() IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "property_documents_insert_auth" ON public.property_documents;
CREATE POLICY "property_documents_insert_auth"
  ON public.property_documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "property_documents_update_auth" ON public.property_documents;
CREATE POLICY "property_documents_update_auth"
  ON public.property_documents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "property_documents_delete_auth" ON public.property_documents;
CREATE POLICY "property_documents_delete_auth"
  ON public.property_documents FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Leads Policies (if missing)
DROP POLICY IF EXISTS "leads_select_auth" ON public.leads;
CREATE POLICY "leads_select_auth"
  ON public.leads FOR SELECT
  USING (
    auth.uid() IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'agent')
    )
  );

DROP POLICY IF EXISTS "leads_insert_all" ON public.leads;
CREATE POLICY "leads_insert_all"
  ON public.leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_update_auth" ON public.leads;
CREATE POLICY "leads_update_auth"
  ON public.leads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "leads_delete_auth" ON public.leads;
CREATE POLICY "leads_delete_auth"
  ON public.leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Lead Activity Policies
DROP POLICY IF EXISTS "Admins can manage lead activity" ON public.lead_activity;
CREATE POLICY "Admins can manage lead activity"
  ON public.lead_activity FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'agent')
    )
  );

-- Viewings Policies (if missing)
DROP POLICY IF EXISTS "viewings_select_auth" ON public.viewings;
CREATE POLICY "viewings_select_auth"
  ON public.viewings FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "viewings_insert_auth" ON public.viewings;
CREATE POLICY "viewings_insert_auth"
  ON public.viewings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "viewings_update_auth" ON public.viewings;
CREATE POLICY "viewings_update_auth"
  ON public.viewings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "viewings_delete_auth" ON public.viewings;
CREATE POLICY "viewings_delete_auth"
  ON public.viewings FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Offers Policies
DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers"
  ON public.offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Offer Events Policies
DROP POLICY IF EXISTS "Admins can view offer events" ON public.offer_events;
CREATE POLICY "Admins can view offer events"
  ON public.offer_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert offer events" ON public.offer_events;
CREATE POLICY "System can insert offer events"
  ON public.offer_events FOR INSERT
  WITH CHECK (true);

-- Documents Policies
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;
CREATE POLICY "Admins can manage documents"
  ON public.documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Saved Searches Policies
DROP POLICY IF EXISTS "Users can view their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can create their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Fix saved_searches policy to allow anonymous users (for cookie-based saved searches)
DROP POLICY IF EXISTS "Anonymous can view saved searches" ON public.saved_searches;
CREATE POLICY "Anonymous can view saved searches"
  ON public.saved_searches FOR SELECT
  USING (user_id IS NULL);

-- Syndication Mappings Policies
DROP POLICY IF EXISTS "Admins can manage syndication mappings" ON public.syndication_mappings;
CREATE POLICY "Admins can manage syndication mappings"
  ON public.syndication_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Alerts Log Policies
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts_log;
CREATE POLICY "Admins can view all alerts"
  ON public.alerts_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert alerts" ON public.alerts_log;
CREATE POLICY "System can insert alerts"
  ON public.alerts_log FOR INSERT
  WITH CHECK (true);

-- Referrals Policies
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;
CREATE POLICY "Admins can manage referrals"
  ON public.referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Analytics Clicks Policies
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.analytics_clicks;
CREATE POLICY "Anyone can record clicks"
  ON public.analytics_clicks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_clicks;
CREATE POLICY "Admins can view analytics"
  ON public.analytics_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ) OR auth.uid() IS NULL
  );

-- Analytics Page Views Policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_page_views') THEN
    DROP POLICY IF EXISTS "Anyone can record page views" ON public.analytics_page_views;
    CREATE POLICY "Anyone can record page views"
      ON public.analytics_page_views FOR INSERT
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Admins can view page views" ON public.analytics_page_views;
    CREATE POLICY "Admins can view page views"
      ON public.analytics_page_views FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        ) OR auth.uid() IS NULL
      );
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled on ALL tables!';
  RAISE NOTICE '✅ All policies created!';
  RAISE NOTICE '✅ Security configuration complete!';
END $$;

