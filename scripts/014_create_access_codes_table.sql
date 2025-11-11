-- Create access_codes table for enrollment access control
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  utilizada BOOLEAN DEFAULT FALSE NOT NULL,
  id_aluno_uso UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  data_uso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_codes_codigo ON access_codes(codigo);
CREATE INDEX IF NOT EXISTS idx_access_codes_utilizada ON access_codes(utilizada);

-- Enable RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if a code exists and is available (for validation)
CREATE POLICY "Anyone can validate access codes"
  ON access_codes
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete codes
CREATE POLICY "Admins can manage access codes"
  ON access_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollment_users
      WHERE enrollment_users.id = auth.uid()
      AND enrollment_users.role = 'admin'
      AND enrollment_users.is_active = true
    )
  );
