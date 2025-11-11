-- Comprehensive schema fix for enrollments table
-- This script safely adds all missing columns and updates constraints
-- Run this script in your Supabase SQL Editor

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add rg_student column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='enrollments' AND column_name='rg_student') THEN
        ALTER TABLE public.enrollments ADD COLUMN rg_student VARCHAR(20);
    END IF;

    -- Add nis column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='enrollments' AND column_name='nis') THEN
        ALTER TABLE public.enrollments ADD COLUMN nis VARCHAR(20);
    END IF;

    -- Add education_network column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='enrollments' AND column_name='education_network') THEN
        ALTER TABLE public.enrollments ADD COLUMN education_network VARCHAR(50);
    END IF;
END $$;

-- Step 2: Make optional fields nullable (only if they're currently NOT NULL)
DO $$
BEGIN
    -- Make email nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='enrollments' AND column_name='email' AND is_nullable='NO') THEN
        ALTER TABLE public.enrollments ALTER COLUMN email DROP NOT NULL;
    END IF;

    -- Make address_number nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='enrollments' AND column_name='address_number' AND is_nullable='NO') THEN
        ALTER TABLE public.enrollments ALTER COLUMN address_number DROP NOT NULL;
    END IF;

    -- Make nis nullable (it's optional)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='enrollments' AND column_name='nis' AND is_nullable='NO') THEN
        ALTER TABLE public.enrollments ALTER COLUMN nis DROP NOT NULL;
    END IF;
END $$;

-- Step 3: Update existing records to have proper values for new required fields
-- Set default values for education_network if it's NULL
UPDATE public.enrollments 
SET education_network = 'Pública' 
WHERE education_network IS NULL;

-- Set default values for rg_student if it's NULL (use a placeholder)
UPDATE public.enrollments 
SET rg_student = 'PENDENTE' 
WHERE rg_student IS NULL;

-- Step 4: Now make required fields NOT NULL (after setting defaults)
DO $$
BEGIN
    -- Make rg_student NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='enrollments' AND column_name='rg_student' AND is_nullable='YES') THEN
        ALTER TABLE public.enrollments ALTER COLUMN rg_student SET NOT NULL;
    END IF;

    -- Make education_network NOT NULL
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='enrollments' AND column_name='education_network' AND is_nullable='YES') THEN
        ALTER TABLE public.enrollments ALTER COLUMN education_network SET NOT NULL;
    END IF;
END $$;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enrollments_rg_student ON public.enrollments(rg_student);
CREATE INDEX IF NOT EXISTS idx_enrollments_nis ON public.enrollments(nis);
CREATE INDEX IF NOT EXISTS idx_enrollments_education_network ON public.enrollments(education_network);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.enrollments.rg_student IS 'Student ID document (RG) - Required';
COMMENT ON COLUMN public.enrollments.nis IS 'Social Identification Number (NIS) - Optional';
COMMENT ON COLUMN public.enrollments.education_network IS 'Education network (Pública/Privada) - Required';
COMMENT ON COLUMN public.enrollments.email IS 'Contact email - Optional';
COMMENT ON COLUMN public.enrollments.address_number IS 'House/building number - Optional';
