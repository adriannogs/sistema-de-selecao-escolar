-- Add field to track if enrollment form was printed
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS form_printed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS form_printed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS form_printed_by CHARACTER VARYING;

-- Add comment
COMMENT ON COLUMN enrollments.form_printed IS 'Indica se a ficha de matrícula foi impressa';
COMMENT ON COLUMN enrollments.form_printed_at IS 'Data e hora em que a ficha foi impressa';
COMMENT ON COLUMN enrollments.form_printed_by IS 'Usuário que imprimiu a ficha';
