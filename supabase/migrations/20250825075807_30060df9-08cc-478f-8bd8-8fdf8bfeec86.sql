-- Migrate data from profiles to students and teachers tables
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
  'Teacher' as designation  -- Default designation since profiles doesn't have this field
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

-- Drop the profiles table
DROP TABLE public.profiles;