-- Add RG field for guardians
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS guardian_1_rg TEXT,
ADD COLUMN IF NOT EXISTS guardian_2_rg TEXT;

-- Update existing records to split cpfRg into separate fields if needed
-- This is a one-time migration for existing data
