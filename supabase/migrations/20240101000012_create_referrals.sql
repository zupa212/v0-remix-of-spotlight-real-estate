-- Create referrals table for affiliate/partner tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('agent', 'partner')),
  owner_id UUID NOT NULL,
  commission_pct DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add referral tracking to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_owner ON referrals(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_referral_code ON leads(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage referrals"
  ON referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Agents can view their own referral codes"
  ON referrals FOR SELECT
  USING (
    owner_type = 'agent' AND owner_id = auth.uid()
  );
