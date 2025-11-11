-- Fix enrollments table schema to match current requirements
-- Add missing columns and update constraints

-- Add missing columns if they don't exist
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS rg_student VARCHAR(20),
ADD COLUMN IF NOT EXISTS nis VARCHAR(20),
ADD COLUMN IF NOT EXISTS education_network VARCHAR(50);

-- Make optional fields nullable
ALTER TABLE public.enrollments 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN address_number DROP NOT NULL;

-- Update rg_student to be NOT NULL (it's required)
ALTER TABLE public.enrollments 
ALTER COLUMN rg_student SET NOT NULL;

-- Update education_network to be NOT NULL (it's required)
ALTER TABLE public.enrollments 
ALTER COLUMN education_network SET NOT NULL;

-- Add default value for school_of_origin if it's NULL
ALTER TABLE public.enrollments 
ALTER COLUMN school_of_origin SET NOT NULL;

-- Create index for new columns
CREATE INDEX IF NOT EXISTS idx_enrollments_rg_student ON public.enrollments(rg_student);
CREATE INDEX IF NOT EXISTS idx_enrollments_nis ON public.enrollments(nis);
