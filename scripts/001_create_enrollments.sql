-- Create enrollments table for Pre-Matricula 2026
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number VARCHAR(20) UNIQUE NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  
  -- Course (optional)
  course_name VARCHAR(255),
  
  -- Student Data
  student_name VARCHAR(255) NOT NULL,
  student_cpf VARCHAR(14),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  nationality VARCHAR(255) DEFAULT 'Brasileira',
  school_of_origin VARCHAR(255),
  
  -- Address
  address_street VARCHAR(255) NOT NULL,
  address_number VARCHAR(20) NOT NULL,
  address_complement VARCHAR(255),
  address_neighborhood VARCHAR(255) NOT NULL,
  address_city VARCHAR(255) NOT NULL,
  address_state VARCHAR(2) NOT NULL,
  address_zip_code VARCHAR(10) NOT NULL,
  
  -- Contact
  email VARCHAR(255) NOT NULL,
  phone_main VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  
  -- Guardians (stored as JSON for flexibility)
  guardians JSONB,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_protocol ON public.enrollments(protocol_number);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON public.enrollments(created_at);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read (by protocol)
CREATE POLICY "Anyone can view enrollment by protocol" 
  ON public.enrollments 
  FOR SELECT 
  USING (true);

-- Create policy for admin access (requires admin API key)
CREATE POLICY "Admins can insert, update, delete enrollments"
  ON public.enrollments
  FOR ALL
  USING (
    current_setting('request.headers'::text, true)::json->>'x-admin-api-key' = current_setting('app.admin_api_key'::text, true)
  );

-- Alternative simple policy (if admin key not needed)
CREATE POLICY "Anyone can insert enrollments"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (true);
