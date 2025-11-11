-- Add document fields to enrollments table
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS rg_student VARCHAR(20),
ADD COLUMN IF NOT EXISTS nis VARCHAR(20),
ADD COLUMN IF NOT EXISTS rg_guardian VARCHAR(20);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_enrollments_rg_student ON public.enrollments(rg_student);
CREATE INDEX IF NOT EXISTS idx_enrollments_nis ON public.enrollments(nis);
