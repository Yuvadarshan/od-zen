-- Update the od_type check constraint to match the form values
ALTER TABLE public.od_requests 
DROP CONSTRAINT od_requests_od_type_check;

ALTER TABLE public.od_requests 
ADD CONSTRAINT od_requests_od_type_check 
CHECK (od_type IN ('sports', 'cultural', 'academic', 'technical', 'other'));