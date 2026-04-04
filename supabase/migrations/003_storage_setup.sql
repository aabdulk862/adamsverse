-- 003_storage_setup.sql
-- Supabase Storage bucket and access policies for project files
-- Requirements: 7.1, 7.2, 7.3, 7.6

-- ============================================================
-- Create the project-files bucket
-- ============================================================
-- Files are organized by project ID: project-files/<project_id>/<filename>
-- Max upload size: 100 MB (104857600 bytes)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'project-files',
  'project-files',
  false,
  104857600  -- 100 MB in bytes
);

-- ============================================================
-- Storage RLS policies
-- ============================================================
-- Bucket path convention: project-files/<project_id>/<filename>
-- The first path segment after the bucket name is the project_id.

-- Clients can SELECT (download) files for their own projects
CREATE POLICY "storage_select_own_project_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = (storage.foldername(name))[1]::uuid
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can SELECT (download) all project files
CREATE POLICY "storage_select_admin_project_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'admin'
  );

-- Clients can INSERT (upload) files to their own projects
CREATE POLICY "storage_insert_own_project_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = (storage.foldername(name))[1]::uuid
        AND projects.client_id = auth.uid()
    )
  );

-- Admin can INSERT (upload) files to any project
CREATE POLICY "storage_insert_admin_project_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'admin'
  );

-- Admin can UPDATE file metadata for any project
CREATE POLICY "storage_update_admin_project_files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'admin'
  )
  WITH CHECK (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'admin'
  );

-- Admin can DELETE files from any project
CREATE POLICY "storage_delete_admin_project_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files'
    AND public.current_user_role() = 'admin'
  );

-- ============================================================
-- Signed URL generation (application-level documentation)
-- ============================================================
-- Signed URLs are generated client-side via the Supabase JS SDK:
--
--   const { data } = await supabase.storage
--     .from('project-files')
--     .createSignedUrl(`${projectId}/${fileName}`, 900);  // 900 seconds = 15 minutes
--
-- The 15-minute expiry ensures time-limited access to files.
-- RLS policies above ensure only authorized users can generate
-- signed URLs for files they have access to.
