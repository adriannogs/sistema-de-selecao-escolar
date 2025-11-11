-- Add access_code_id column to enrollments table to track which code was used
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS access_code_id UUID REFERENCES access_codes(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_access_code_id ON enrollments(access_code_id);
