-- Add enrollment_number field to enrollments table
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_number INTEGER;

-- Create a sequence for enrollment numbers starting from 1
CREATE SEQUENCE IF NOT EXISTS enrollment_number_seq START WITH 1 INCREMENT BY 1;

-- Update existing enrollments with sequential numbers based on created_at
WITH numbered_enrollments AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM enrollments
  WHERE enrollment_number IS NULL
)
UPDATE enrollments
SET enrollment_number = numbered_enrollments.row_num
FROM numbered_enrollments
WHERE enrollments.id = numbered_enrollments.id;

-- Set the sequence to continue from the highest existing number
SELECT setval('enrollment_number_seq', COALESCE((SELECT MAX(enrollment_number) FROM enrollments), 0) + 1, false);
