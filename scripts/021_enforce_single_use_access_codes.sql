-- Enforce single-use access codes at database level
-- This prevents race conditions where two students might try to use the same code simultaneously

-- Add a unique constraint on access_code_id in enrollments table
-- This ensures that each access code can only be linked to one enrollment
ALTER TABLE enrollments
ADD CONSTRAINT unique_access_code_per_enrollment 
UNIQUE (access_code_id);

-- Create an index on utilizada column for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_codes_utilizada 
ON access_codes(utilizada) 
WHERE utilizada = false;

-- Create an index on codigo for faster validation
CREATE INDEX IF NOT EXISTS idx_access_codes_codigo 
ON access_codes(codigo);

-- Add a check constraint to ensure that if utilizada is true, id_aluno_uso must be set
ALTER TABLE access_codes
ADD CONSTRAINT check_utilizada_has_aluno 
CHECK (
  (utilizada = false AND id_aluno_uso IS NULL) OR
  (utilizada = true AND id_aluno_uso IS NOT NULL)
);

-- Create a function to atomically mark a code as used
CREATE OR REPLACE FUNCTION mark_access_code_used(
  p_codigo TEXT,
  p_enrollment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_id UUID;
  v_already_used BOOLEAN;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT id, utilizada INTO v_code_id, v_already_used
  FROM access_codes
  WHERE codigo = p_codigo
  FOR UPDATE;
  
  -- Check if code exists
  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Código de acesso não encontrado';
  END IF;
  
  -- Check if already used
  IF v_already_used THEN
    RAISE EXCEPTION 'Código de acesso já foi utilizado';
  END IF;
  
  -- Mark as used
  UPDATE access_codes
  SET 
    utilizada = true,
    id_aluno_uso = p_enrollment_id,
    data_uso = NOW(),
    updated_at = NOW()
  WHERE id = v_code_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_access_code_used(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_access_code_used(TEXT, UUID) TO anon;
