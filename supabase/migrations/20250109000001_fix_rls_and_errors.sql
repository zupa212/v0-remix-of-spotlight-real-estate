-- ============================================================================
-- FIX RLS POLICIES & DATABASE ERRORS
-- Run this after ALL_MIGRATIONS_COMBINED.sql to ensure all RLS is enabled
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES (IDEMPOTENT)
-- ============================================================================

DO $$
BEGIN
  -- Enable RLS on all public tables
  ALTER TABLE IF EXISTS public.property_images ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.property_documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.lead_activity ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.viewings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.offer_events ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.saved_searches ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.syndication_mappings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.alerts_log ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.analytics_clicks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.experiments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.experiment_metrics ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.consents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.task_templates ENABLE ROW LEVEL SECURITY;
END $$;

-- ============================================================================
-- 2. FIX MISSING COLUMNS (DATABASE ERRORS)
-- ============================================================================

-- Fix syndication_mappings.portal column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'syndication_mappings' 
    AND column_name = 'portal'
  ) THEN
    ALTER TABLE public.syndication_mappings 
    ADD COLUMN portal TEXT NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

-- Fix leads table - ensure proper columns exist
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN phone TEXT;
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE/REPLACE RLS POLICIES (IDEMPOTENT)
-- ============================================================================

-- Property Images Policies
DROP POLICY IF EXISTS "property_images_select_all" ON public.property_images;
CREATE POLICY "property_images_select_all"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_images.property_id 
      AND (published = true OR auth.uid() IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "property_images_insert_auth" ON public.property_images;
CREATE POLICY "property_images_insert_auth"
  ON public.property_images FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "property_images_update_auth" ON public.property_images;
CREATE POLICY "property_images_update_auth"
  ON public.property_images FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "property_images_delete_auth" ON public.property_images;
CREATE POLICY "property_images_delete_auth"
  ON public.property_images FOR DELETE
  USING (auth.uid() IS NOT NULL);

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
      AND profiles.role = 'admin'
    )
  );

-- Viewings Policies
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
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.saved_searches;
CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

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
    )
  );

-- Experiments Policies
DROP POLICY IF EXISTS "Admins can manage experiments" ON public.experiments;
CREATE POLICY "Admins can manage experiments"
  ON public.experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Experiment Metrics Policies
DROP POLICY IF EXISTS "Anyone can record experiment metrics" ON public.experiment_metrics;
CREATE POLICY "Anyone can record experiment metrics"
  ON public.experiment_metrics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view experiment metrics" ON public.experiment_metrics;
CREATE POLICY "Admins can view experiment metrics"
  ON public.experiment_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Consents Policies
DROP POLICY IF EXISTS "Admins can view all consents" ON public.consents;
CREATE POLICY "Admins can view all consents"
  ON public.consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert consents" ON public.consents;
CREATE POLICY "System can insert consents"
  ON public.consents FOR INSERT
  WITH CHECK (true);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Tasks Policies
DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
CREATE POLICY "Admins can manage tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Task Templates Policies
DROP POLICY IF EXISTS "Admins can manage task templates" ON public.task_templates;
CREATE POLICY "Admins can manage task templates"
  ON public.task_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. FIX VIEWINGS FOREIGN KEY RELATIONSHIPS
-- ============================================================================

-- Ensure viewings table has proper foreign keys
DO $$
BEGIN
  -- Add lead_id foreign key if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'viewings'
    AND constraint_name LIKE '%lead_id%'
  ) THEN
    -- Check if lead_id column exists first
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'viewings'
      AND column_name = 'lead_id'
    ) THEN
      ALTER TABLE public.viewings
      ADD CONSTRAINT viewings_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
    END IF;
  END IF;
  
  -- Add property_id foreign key if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'viewings'
    AND constraint_name LIKE '%property_id%'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'viewings'
      AND column_name = 'property_id'
    ) THEN
      ALTER TABLE public.viewings
      ADD CONSTRAINT viewings_property_id_fkey
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  -- Add agent_id foreign key if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'viewings'
    AND constraint_name LIKE '%agent_id%'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'viewings'
      AND column_name = 'agent_id'
    ) THEN
      ALTER TABLE public.viewings
      ADD CONSTRAINT viewings_agent_id_fkey
      FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled on all tables!';
  RAISE NOTICE '✅ All policies created!';
  RAISE NOTICE '✅ Database errors fixed!';
END $$;

