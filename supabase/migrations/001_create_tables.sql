-- 001_create_tables.sql
-- Creates all tables for the Adverse LLC SaaS platform
-- Requirements: 12.1, 12.3

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       text NOT NULL,
  display_name text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'client'
              CHECK (role IN ('client', 'admin')),
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles synced from Google OAuth via Supabase Auth';

-- ============================================================
-- 2. projects
-- ============================================================
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  service_tier text NOT NULL
              CHECK (service_tier IN ('landing-page', 'full-stack-application', 'consulting')),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'Discovery'
              CHECK (status IN ('Discovery', 'In Progress', 'Review', 'Revision', 'Delivered', 'Closed')),
  intake_data jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE projects IS 'Client projects scoped to a service tier';

-- Auto-update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. project_status_history
-- ============================================================
CREATE TABLE project_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  status      text NOT NULL,
  description text,
  changed_by  uuid REFERENCES profiles (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE project_status_history IS 'Audit log of project status transitions';

-- ============================================================
-- 4. project_feedback
-- ============================================================
CREATE TABLE project_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  client_id   uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE project_feedback IS 'Client feedback submitted during Review status';

-- ============================================================
-- 5. invoices
-- ============================================================
CREATE TABLE invoices (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  client_id               uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  status                  text NOT NULL DEFAULT 'Draft'
                          CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue')),
  line_items              jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount            numeric NOT NULL DEFAULT 0,
  tax_amount              numeric NOT NULL DEFAULT 0,
  due_date                date,
  paid_at                 timestamptz,
  stripe_payment_intent_id text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE invoices IS 'Billing records tied to projects, integrated with Stripe';

-- ============================================================
-- 6. messages
-- ============================================================
CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  content     text NOT NULL,
  file_url    text,
  file_name   text,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE messages IS 'Per-project message threads between client and admin';

-- ============================================================
-- 7. notification_preferences
-- ============================================================
CREATE TABLE notification_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  project_updates boolean NOT NULL DEFAULT true,
  invoice_updates boolean NOT NULL DEFAULT true,
  message_updates boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id)
);

COMMENT ON TABLE notification_preferences IS 'Per-client email notification toggles';

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
CREATE INDEX idx_projects_client_id ON projects (client_id);
CREATE INDEX idx_project_status_history_project_id ON project_status_history (project_id);
CREATE INDEX idx_project_feedback_project_id ON project_feedback (project_id);
CREATE INDEX idx_invoices_client_id ON invoices (client_id);
CREATE INDEX idx_invoices_project_id ON invoices (project_id);
CREATE INDEX idx_messages_project_id ON messages (project_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_notification_preferences_client_id ON notification_preferences (client_id);
