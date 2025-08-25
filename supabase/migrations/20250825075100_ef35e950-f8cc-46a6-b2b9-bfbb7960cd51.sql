-- Create separate tables for students and teachers with strict RLS
-- and automatic updated_at handling.

-- 1) STUDENTS TABLE
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  register_number TEXT,
  department TEXT,
  section TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT students_user_unique UNIQUE (user_id)
);

-- Enable RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policies for students: user can manage their own row only
CREATE POLICY "Students can view their own record"
ON public.students
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own record"
ON public.students
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own record"
ON public.students
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index
CREATE INDEX idx_students_user_id ON public.students(user_id);


-- 2) TEACHERS TABLE
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  department TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT teachers_user_unique UNIQUE (user_id)
);

-- Enable RLS for teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policies for teachers: user can manage their own row only
CREATE POLICY "Teachers can view their own record"
ON public.teachers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own record"
ON public.teachers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own record"
ON public.teachers
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);