-- Create analytics_page_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_route ON public.analytics_page_views(route);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_viewed_at ON public.analytics_page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_property ON public.analytics_page_views(property_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_agent ON public.analytics_page_views(agent_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_region ON public.analytics_page_views(region_id);

-- Enable RLS
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
    )
  );

