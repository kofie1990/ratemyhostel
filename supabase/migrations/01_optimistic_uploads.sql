-- 01_optimistic_uploads.sql

-- Make hostel_id nullable (it likely already is, but being explicit)
ALTER TABLE rooms ALTER COLUMN hostel_id DROP NOT NULL;

-- Add a status column to support the Optimistic Upload strategy
-- 'published': Visible in the global feed and directory.
-- 'pending_mapping': Uploaded optimistically but waiting for admin to map the requested hostel.
ALTER TABLE rooms ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending_mapping'));
