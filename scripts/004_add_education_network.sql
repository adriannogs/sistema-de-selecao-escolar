-- Add education_network field to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS education_network VARCHAR(50);

-- Add index for education_network
CREATE INDEX IF NOT EXISTS idx_enrollments_education_network 
ON public.enrollments(education_network);
