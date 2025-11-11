-- Update existing enrollments that have null enrollment_number
-- This assigns sequential numbers based on the order of creation (created_at)

WITH numbered_enrollments AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM enrollments
  WHERE enrollment_number IS NULL
)
UPDATE enrollments
SET enrollment_number = numbered_enrollments.row_num
FROM numbered_enrollments
WHERE enrollments.id = numbered_enrollments.id;

-- Update the sequence to continue from the highest existing number
SELECT setval('enrollment_number_seq', COALESCE((SELECT MAX(enrollment_number) FROM enrollments), 0), false);
