-- Ensure enrollment_users table has all necessary constraints
-- This script is idempotent and can be run multiple times safely

-- First, check if the table exists, if not create it
CREATE TABLE IF NOT EXISTS public.enrollment_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add UNIQUE constraint on email if it doesn't exist
DO $$
BEGIN
    -- Check if the unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'enrollment_users_email_key' 
        AND conrelid = 'public.enrollment_users'::regclass
    ) THEN
        -- Add the unique constraint
        ALTER TABLE public.enrollment_users 
        ADD CONSTRAINT enrollment_users_email_key UNIQUE (email);
        
        RAISE NOTICE 'Added UNIQUE constraint on email column';
    ELSE
        RAISE NOTICE 'UNIQUE constraint on email already exists';
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_enrollment_users_email ON public.enrollment_users(email);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_active ON public.enrollment_users(is_active);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_role ON public.enrollment_users(role);

-- Ensure RLS is enabled
ALTER TABLE public.enrollment_users ENABLE ROW LEVEL SECURITY;

-- Drop old problematic policies if they exist
DROP POLICY IF EXISTS "Admins can manage enrollment users" ON public.enrollment_users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.enrollment_users;
DROP POLICY IF EXISTS "Users can view their own data (SELECT)" ON public.enrollment_users;
DROP POLICY IF EXISTS "Admins can manage enrollment users (ALL)" ON public.enrollment_users;

-- Create simple, non-recursive policies
CREATE POLICY "Allow service role full access"
    ON public.enrollment_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read their own record"
    ON public.enrollment_users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Insert admin user with proper existence check to avoid ON CONFLICT issues
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Check if admin user already exists
  SELECT EXISTS (
    SELECT 1 FROM public.enrollment_users WHERE email = 'adriannogs@gmail.com'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- Update existing admin user
    UPDATE public.enrollment_users 
    SET 
      role = 'admin',
      is_active = true,
      updated_at = NOW()
    WHERE email = 'adriannogs@gmail.com';
    
    RAISE NOTICE 'Admin user updated: adriannogs@gmail.com';
  ELSE
    -- Insert new admin user
    INSERT INTO public.enrollment_users (email, full_name, role, is_active)
    VALUES ('adriannogs@gmail.com', 'Administrador Principal', 'admin', true);
    
    RAISE NOTICE 'Admin user created: adriannogs@gmail.com';
  END IF;
  
  RAISE NOTICE 'enrollment_users table is now properly configured';
END $$;
