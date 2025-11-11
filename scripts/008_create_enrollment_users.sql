-- Create enrollment_users table for managing users who can access the enrollment system
CREATE TABLE IF NOT EXISTS public.enrollment_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'operator', -- 'admin' or 'operator'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.enrollment_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage enrollment users"
  ON public.enrollment_users
  FOR ALL
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_users_email ON public.enrollment_users(email);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_active ON public.enrollment_users(is_active);

-- Updated admin email to adriannogs@gmail.com
-- Insert the main admin user
INSERT INTO public.enrollment_users (email, full_name, role, is_active, created_by)
VALUES ('adriannogs@gmail.com', 'Adrian Nogueira', 'admin', true, 'system')
ON CONFLICT (email) DO NOTHING;
