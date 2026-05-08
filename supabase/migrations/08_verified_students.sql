-- 08_verified_students.sql

-- 1. Add verified student flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN DEFAULT false;

-- 2. Update the trigger function to auto-detect .edu emails on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, is_verified_student)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    CASE WHEN new.email LIKE '%.edu' OR new.email LIKE '%.edu.%' THEN true ELSE false END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing users (check auth.users email)
UPDATE profiles SET is_verified_student = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%.edu' OR email LIKE '%.edu.%'
);
