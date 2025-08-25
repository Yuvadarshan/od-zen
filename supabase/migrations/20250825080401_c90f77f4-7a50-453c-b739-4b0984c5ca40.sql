-- Update the handle_new_user function to work with new tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extract role from user metadata
  DECLARE
    user_role text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');
  BEGIN
    IF user_role = 'student' THEN
      INSERT INTO public.students (
        user_id, 
        name, 
        email, 
        register_number, 
        department, 
        section
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data ->> 'register_number',
        NEW.raw_user_meta_data ->> 'department',
        NEW.raw_user_meta_data ->> 'section'
      );
    ELSIF user_role = 'teacher' THEN
      INSERT INTO public.teachers (
        user_id, 
        name, 
        email, 
        department
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data ->> 'department'
      );
    END IF;
  END;
  RETURN NEW;
END;
$$;