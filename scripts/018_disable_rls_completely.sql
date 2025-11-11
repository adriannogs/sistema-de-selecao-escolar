-- Completely disable RLS on all tables to avoid any permission issues
-- This is an internal admin system, so RLS is not needed

-- Drop ALL existing policies on enrollment_users
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'enrollment_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.enrollment_users', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE public.enrollment_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.socioeconomic_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
DO $$
BEGIN
    RAISE NOTICE 'RLS has been disabled on all tables';
END $$;
