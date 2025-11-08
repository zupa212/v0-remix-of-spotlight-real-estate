-- Create task_templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('new', 'contacted', 'qualified', 'viewing', 'offer', 'won', 'lost')),
  title TEXT NOT NULL,
  description TEXT,
  relative_due_days INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assignee_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Insert default task templates
INSERT INTO task_templates (stage, title, description, relative_due_days) VALUES
  ('new', 'Initial Contact', 'Reach out to the lead within 24 hours', 1),
  ('contacted', 'Send Property Details', 'Send detailed information about requested properties', 1),
  ('qualified', 'Schedule Viewing', 'Arrange property viewing appointment', 2),
  ('viewing', 'Follow Up After Viewing', 'Contact lead for feedback after viewing', 1),
  ('offer', 'Prepare Offer Documents', 'Draft offer letter and required documents', 2),
  ('offer', 'Request Financial Pre-approval', 'Ensure buyer has financing in place', 3)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

-- Enable RLS
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage task templates"
  ON task_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
