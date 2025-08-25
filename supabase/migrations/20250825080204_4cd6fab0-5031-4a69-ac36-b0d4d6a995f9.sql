-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.is_teacher(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
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
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students WHERE user_id = user_uuid
  );
$$;