-- First, migrate data from profiles to students and teachers tables
-- Insert student data
INSERT INTO public.students (user_id, register_number, department, section)
SELECT 
  user_id,
  register_number,
  department,
  section
FROM public.profiles 
WHERE role = 'student'
ON CONFLICT (user_id) DO UPDATE SET
  register_number = EXCLUDED.register_number,
  department = EXCLUDED.department,
  section = EXCLUDED.section;

-- Insert teacher data  
INSERT INTO public.teachers (user_id, department, designation)
SELECT 
  user_id,
  department,
  'Teacher' as designation
FROM public.profiles 
WHERE role = 'teacher'
ON CONFLICT (user_id) DO UPDATE SET
  department = EXCLUDED.department,
  designation = EXCLUDED.designation;

-- Add name and email columns to both students and teachers tables
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- Update the new columns with data from profiles
UPDATE public.students 
SET name = p.name, email = p.email
FROM public.profiles p
WHERE students.user_id = p.user_id AND p.role = 'student';

UPDATE public.teachers 
SET name = p.name, email = p.email  
FROM public.profiles p
WHERE teachers.user_id = p.user_id AND p.role = 'teacher';

-- Drop policies that depend on profiles table
DROP POLICY IF EXISTS "Teachers can view all requests" ON public.od_requests;
DROP POLICY IF EXISTS "Teachers can update request status" ON public.od_requests;
DROP POLICY IF EXISTS "Teachers can view all attachments" ON storage.objects;

-- Create security definer functions to check user roles
CREATE OR REPLACE FUNCTION public.is_teacher(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers WHERE user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students WHERE user_id = user_uuid
  );
$$;

-- Recreate policies using the new functions
CREATE POLICY "Teachers can view all requests" 
ON public.od_requests 
FOR SELECT 
USING (public.is_teacher(auth.uid()));

CREATE POLICY "Teachers can update request status"
ON public.od_requests
FOR UPDATE
USING (public.is_teacher(auth.uid()));

CREATE POLICY "Teachers can view all attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'od-attachments' AND public.is_teacher(auth.uid()));

-- Remove foreign key constraints on od_requests table
ALTER TABLE public.od_requests DROP CONSTRAINT IF EXISTS od_requests_student_id_fkey;
ALTER TABLE public.od_requests DROP CONSTRAINT IF EXISTS od_requests_approved_by_fkey;

-- Now we can safely drop the profiles table
DROP TABLE public.profiles;