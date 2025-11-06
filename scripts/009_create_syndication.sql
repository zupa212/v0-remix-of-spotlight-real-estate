-- Create syndication_mappings table for portal feeds
CREATE TABLE IF NOT EXISTS syndication_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal TEXT NOT NULL UNIQUE CHECK (portal IN ('spitogatos', 'xe', 'idealista')),
  mapping_json JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default mappings
INSERT INTO syndication_mappings (portal, mapping_json, is_active) VALUES
  ('spitogatos', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('xe', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false),
  ('idealista', '{"title": "title", "description": "description", "price": "price", "location": "city"}', false)
ON CONFLICT (portal) DO NOTHING;

-- Enable RLS
ALTER TABLE syndication_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin only)
CREATE POLICY "Admins can manage syndication mappings"
  ON syndication_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
