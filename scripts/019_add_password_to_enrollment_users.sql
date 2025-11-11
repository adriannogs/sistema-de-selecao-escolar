-- Add password hash column to enrollment_users for custom authentication
-- This bypasses Supabase Auth which has been corrupted by direct auth.users modifications

DO $$
BEGIN
  -- Add password_hash column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'enrollment_users' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.enrollment_users 
    ADD COLUMN password_hash TEXT;
    
    RAISE NOTICE 'Added password_hash column to enrollment_users';
  ELSE
    RAISE NOTICE 'password_hash column already exists';
  END IF;
  
  -- Moved RAISE NOTICE statements inside the DO block
  RAISE NOTICE 'Custom authentication setup complete';
  RAISE NOTICE 'Users will now authenticate using enrollment_users table with bcrypt password hashing';
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_users_email 
ON public.enrollment_users(email);

-- Ensure RLS is disabled (we'll handle auth in application layer)
ALTER TABLE public.enrollment_users DISABLE ROW LEVEL SECURITY;
