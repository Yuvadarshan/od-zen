-- Create user profiles table for both students and teachers
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  -- Student specific fields
  register_number TEXT,
  department TEXT,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create OD requests table
CREATE TABLE public.od_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  od_type TEXT NOT NULL CHECK (od_type IN ('daily', 'event')),
  title TEXT NOT NULL,
  -- Daily OD fields
  od_date DATE,
  period TEXT,
  timings TEXT,
  -- Event OD fields
  event_name TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(user_id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for OD requests
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for OD requests
CREATE POLICY "Students can view their own requests" 
ON public.od_requests 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all requests" 
ON public.od_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Students can create their own requests" 
ON public.od_requests 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can update request status" 
ON public.od_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- Create attendance table for daily ODs
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  od_request_id UUID NOT NULL REFERENCES public.od_requests(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_present BOOLEAN NOT NULL DEFAULT false,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance
CREATE POLICY "Students can view attendance for their ODs" 
ON public.attendance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.od_requests 
    WHERE id = od_request_id AND student_id = auth.uid()
  )
);

CREATE POLICY "Students can mark attendance for their approved ODs" 
ON public.attendance 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.od_requests 
    WHERE id = od_request_id AND student_id = auth.uid() AND status = 'approved'
  )
);

CREATE POLICY "Students can update their attendance" 
ON public.attendance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.od_requests 
    WHERE id = od_request_id AND student_id = auth.uid()
  )
);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('od-attachments', 'od-attachments', false);

-- Create storage policies
CREATE POLICY "Students can upload their OD attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'od-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view their own attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'od-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can view all attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'od-attachments' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_od_requests_updated_at
  BEFORE UPDATE ON public.od_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();