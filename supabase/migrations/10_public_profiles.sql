-- 10_public_profiles.sql

ALTER TABLE profiles 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Add an index on username for faster lookups when querying public profiles
CREATE INDEX idx_profiles_username ON profiles(username);

-- Update RLS to ensure public profiles can be read by anyone
-- (Profiles currently have a public read policy from initial schema, so we are good. 
-- CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true); is already there.)
