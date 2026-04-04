-- 002_rls_policies.sql
-- Row Level Security policies for all tables
-- Requirements: 12.3, 12.5

-- Helper: returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admin can read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (on first sign-in upsert)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- projects
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Clients can read their own projects
CREATE POLICY "projects_select_own"
  ON projects FOR SELECT
  USING (client_id = auth.uid());

-- Admin can read all projects
CREATE POLICY "projects_select_admin"
  ON projects FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Admin can insert projects
CREATE POLICY "projects_insert_admin"
  ON projects FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

-- Clients can insert their own projects (intake form submission)
CREATE POLICY "projects_insert_own"
  ON projects FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Admin can update all projects
CREATE POLICY "projects_update_admin"
  ON projects FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- Admin can delete projects
CREATE POLICY "projects_delete_admin"
  ON projects FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ============================================================
-- project_status_history
-- ============================================================
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;

-- Clients can read history for their own projects
CREATE POLICY "project_status_history_select_own"
  ON project_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_status_history.project_id
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can read all status history
CREATE POLICY "project_status_history_select_admin"
  ON project_status_history FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Admin can insert status history entries
CREATE POLICY "project_status_history_insert_admin"
  ON project_status_history FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

-- ============================================================
-- project_feedback
-- ============================================================
ALTER TABLE project_feedback ENABLE ROW LEVEL SECURITY;

-- Clients can read feedback for their own projects
CREATE POLICY "project_feedback_select_own"
  ON project_feedback FOR SELECT
  USING (client_id = auth.uid());

-- Clients can insert feedback for their own projects
CREATE POLICY "project_feedback_insert_own"
  ON project_feedback FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_feedback.project_id
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can read all feedback
CREATE POLICY "project_feedback_select_admin"
  ON project_feedback FOR SELECT
  USING (public.current_user_role() = 'admin');

-- ============================================================
-- invoices
-- ============================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Clients can read their own invoices
CREATE POLICY "invoices_select_own"
  ON invoices FOR SELECT
  USING (client_id = auth.uid());

-- Admin can read all invoices
CREATE POLICY "invoices_select_admin"
  ON invoices FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Admin can insert invoices
CREATE POLICY "invoices_insert_admin"
  ON invoices FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

-- Admin can update invoices
CREATE POLICY "invoices_update_admin"
  ON invoices FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- Admin can delete invoices
CREATE POLICY "invoices_delete_admin"
  ON invoices FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ============================================================
-- messages
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Clients can read messages for their own projects
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can read all messages
CREATE POLICY "messages_select_admin"
  ON messages FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Clients can insert messages for their own projects
CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can insert messages for any project
CREATE POLICY "messages_insert_admin"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.current_user_role() = 'admin'
  );

-- ============================================================
-- notification_preferences
-- ============================================================
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Clients can read their own notification preferences
CREATE POLICY "notification_preferences_select_own"
  ON notification_preferences FOR SELECT
  USING (client_id = auth.uid());

-- Clients can update their own notification preferences
CREATE POLICY "notification_preferences_update_own"
  ON notification_preferences FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Clients can insert their own notification preferences
CREATE POLICY "notification_preferences_insert_own"
  ON notification_preferences FOR INSERT
  WITH CHECK (client_id = auth.uid());
