-- Clean setup script for the enrollment system
-- This script ensures all tables exist with correct structure and no RLS issues

-- Drop existing RLS policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "service_role_full_access" ON public.enrollment_users;
DROP POLICY IF EXISTS "authenticated_users_read_by_email" ON public.enrollment_users;
DROP POLICY IF EXISTS "public_read_for_setup" ON public.enrollment_users;
DROP POLICY IF EXISTS "admins_can_manage_all" ON public.enrollment_users;
DROP POLICY IF EXISTS "Admins can manage enrollment users" ON public.enrollment_users;
DROP POLICY IF EXISTS "Authenticated users can read their own record" ON public.enrollment_users;
DROP POLICY IF EXISTS "authenticated_users_can_read_by_email" ON public.enrollment_users;

-- Disable RLS on enrollment_users (simpler approach for internal admin system)
ALTER TABLE public.enrollment_users DISABLE ROW LEVEL SECURITY;

-- Ensure the table has the correct structure
DO $$ 
BEGIN
  -- Check if email column has unique constraint, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'enrollment_users_email_key' 
    AND conrelid = 'public.enrollment_users'::regclass
  ) THEN
    ALTER TABLE public.enrollment_users ADD CONSTRAINT enrollment_users_email_key UNIQUE (email);
    RAISE NOTICE 'Added unique constraint on email';
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully';
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_users_email ON public.enrollment_users(email);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_role ON public.enrollment_users(role);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_is_active ON public.enrollment_users(is_active);

-- Ensure other tables also have RLS disabled for simplicity
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.socioeconomic_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
