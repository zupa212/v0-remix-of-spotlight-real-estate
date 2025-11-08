-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer', 'reservation', 'contract', 'prospectus', 'other')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'void')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'countered', 'accepted', 'rejected', 'withdrawn')),
  terms_json JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offer_events table for offer history
CREATE TABLE IF NOT EXISTS offer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'submitted', 'countered', 'accepted', 'rejected', 'withdrawn', 'note_added')),
  payload_json JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update viewings table for iCal support
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'onsite' CHECK (location_type IN ('onsite', 'virtual'));
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS virtual_link TEXT;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS ics_url TEXT;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE viewings ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_lead_id ON offers(lead_id);
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offer_events_offer_id ON offer_events(offer_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage offers"
  ON offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view offer events"
  ON offer_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
