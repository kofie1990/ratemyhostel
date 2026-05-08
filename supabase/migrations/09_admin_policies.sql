-- 09_admin_policies.sql
-- Grant INSERT, UPDATE, DELETE on hostels for service_role (admin API routes)
-- The anon/authenticated roles only have SELECT (public read).
-- Admin operations will be performed via server-side API routes using the service key.

-- Allow INSERT on hostels (admin only via service role - bypass RLS)
-- These policies allow INSERT/UPDATE/DELETE when accessed via the service key
CREATE POLICY "Service role can insert hostels." ON hostels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update hostels." ON hostels
  FOR UPDATE USING (true);

CREATE POLICY "Service role can delete hostels." ON hostels
  FOR DELETE USING (true);
