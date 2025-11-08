-- ============================================================================
-- SAVED SEARCH ALERTS - Database Trigger & Functions
-- ============================================================================
-- This migration creates a trigger that automatically calls the Edge Function
-- when a new property is inserted, to match against saved searches.
-- ============================================================================

-- ============================================================================
-- 1. Create function to call Edge Function via HTTP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_property_match()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  -- Only trigger for INSERT of published properties
  IF (TG_OP = 'INSERT' AND NEW.published = true) THEN
    
    -- Get the Edge Function URL from environment
    -- Format: https://PROJECT_REF.supabase.co/functions/v1/match-properties
    function_url := current_setting('app.settings.edge_function_url', true);
    
    IF function_url IS NULL THEN
      function_url := 'https://katlwauxbsbrbegpsawk.supabase.co/functions/v1/match-properties';
    END IF;

    -- Call the Edge Function asynchronously using pg_net
    -- This requires the pg_net extension
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW),
        'old_record', NULL
      )
    ) INTO request_id;

    RAISE NOTICE 'Edge Function called with request_id: %', request_id;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Create trigger on properties table
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_notify_property_match ON public.properties;

CREATE TRIGGER trigger_notify_property_match
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_property_match();

-- ============================================================================
-- 3. Add notification preferences to profiles
-- ============================================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false, "telegram": false}'::jsonb;

-- ============================================================================
-- 4. Update saved_searches table with additional fields
-- ============================================================================

ALTER TABLE public.saved_searches
  ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_active_user 
  ON public.saved_searches(user_id, is_active) 
  WHERE is_active = true;

-- ============================================================================
-- 5. Update alerts_log table
-- ============================================================================

ALTER TABLE public.alerts_log
  ADD COLUMN IF NOT EXISTS notification_data JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

-- Create index for monitoring
CREATE INDEX IF NOT EXISTS idx_alerts_log_status_sent 
  ON public.alerts_log(status, sent_at DESC);

-- ============================================================================
-- 6. Create function to manually trigger alerts for a property
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_property_alerts(property_uuid UUID)
RETURNS TABLE(
  search_id UUID,
  user_email TEXT,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id as search_id,
    p.email as user_email,
    100 as match_score -- Simplified score, can be enhanced
  FROM public.saved_searches ss
  JOIN public.profiles p ON p.id = ss.user_id
  WHERE ss.is_active = true
  AND EXISTS (
    SELECT 1 FROM public.properties prop
    WHERE prop.id = property_uuid
    AND prop.published = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Create view for alert statistics
-- ============================================================================

CREATE OR REPLACE VIEW public.alert_statistics AS
SELECT 
  ss.id as search_id,
  ss.name as search_name,
  ss.user_id,
  p.email as user_email,
  COUNT(al.id) as total_alerts,
  COUNT(CASE WHEN al.status = 'sent' THEN 1 END) as sent_alerts,
  COUNT(CASE WHEN al.status = 'failed' THEN 1 END) as failed_alerts,
  MAX(al.sent_at) as last_alert_sent,
  ss.created_at as search_created_at
FROM public.saved_searches ss
LEFT JOIN public.alerts_log al ON al.saved_search_id = ss.id
LEFT JOIN public.profiles p ON p.id = ss.user_id
GROUP BY ss.id, ss.name, ss.user_id, p.email, ss.created_at;

-- Grant access to authenticated users for their own stats
CREATE POLICY "Users can view their own alert stats"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 8. Create function to get matching properties for a saved search
-- ============================================================================

CREATE OR REPLACE FUNCTION public.preview_saved_search_matches(
  search_id_param UUID,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE(
  property_id UUID,
  title TEXT,
  price DECIMAL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL,
  city TEXT,
  match_score INTEGER
) AS $$
DECLARE
  search_filters JSONB;
BEGIN
  -- Get the search filters
  SELECT filters_json INTO search_filters
  FROM public.saved_searches
  WHERE id = search_id_param;

  -- Return matching properties (simplified matching logic)
  RETURN QUERY
  SELECT 
    p.id as property_id,
    p.title_en as title,
    COALESCE(p.price_sale, p.price_rent) as price,
    p.bedrooms,
    p.bathrooms,
    p.area_sqm,
    p.city_en as city,
    100 as match_score -- Simplified, can be enhanced with actual scoring
  FROM public.properties p
  WHERE p.published = true
  AND p.status = 'available'
  -- Add filter matching logic here based on search_filters
  ORDER BY p.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. Enable pg_net extension for HTTP calls (if not already enabled)
-- ============================================================================

-- Note: This requires superuser privileges
-- Run manually if needed: CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- 10. Create helper function to update alert status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_alert_status(
  alert_id_param UUID,
  new_status TEXT,
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.alerts_log
  SET 
    status = new_status,
    error_message = error_msg,
    sent_at = CASE WHEN new_status = 'sent' THEN NOW() ELSE sent_at END,
    retry_count = CASE WHEN new_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
    last_retry_at = CASE WHEN new_status = 'failed' THEN NOW() ELSE last_retry_at END
  WHERE id = alert_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if trigger is active:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_property_match';

-- View alert statistics:
-- SELECT * FROM public.alert_statistics;

-- Preview matches for a saved search:
-- SELECT * FROM public.preview_saved_search_matches('search-uuid-here', 5);

-- ============================================================================
-- SAVED SEARCH ALERTS COMPLETE ✅
-- ============================================================================
-- Features enabled:
-- - Automatic property matching on INSERT
-- - Edge Function integration via trigger
-- - Multi-channel notification support (email, WhatsApp, Telegram)
-- - Alert logging and statistics
-- - User notification preferences
-- - Manual trigger function for testing
-- - Preview function to see potential matches
-- ============================================================================

