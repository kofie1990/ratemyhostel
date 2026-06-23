-- 11_student_verifications.sql

-- Create the student_verifications table to store OTPs temporarily
CREATE TABLE IF NOT EXISTS public.student_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verifications
CREATE POLICY "Users can view their own verifications"
  ON public.student_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to delete their own verifications
CREATE POLICY "Users can delete their own verifications"
  ON public.student_verifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add student_email column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_email text;
