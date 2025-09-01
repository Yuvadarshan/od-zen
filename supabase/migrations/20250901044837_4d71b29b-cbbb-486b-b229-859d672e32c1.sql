-- Create events table for teacher-created events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  od_type TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Teachers can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (is_teacher(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Teachers can view all events" 
ON public.events 
FOR SELECT 
USING (is_teacher(auth.uid()));

CREATE POLICY "Students can view events" 
ON public.events 
FOR SELECT 
USING (is_student(auth.uid()));

CREATE POLICY "Teachers can update their events" 
ON public.events 
FOR UPDATE 
USING (is_teacher(auth.uid()) AND auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();