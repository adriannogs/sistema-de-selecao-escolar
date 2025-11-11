-- Fix RLS policies for enrollment_users table to allow authenticated users to read their own records

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage enrollment users" ON public.enrollment_users;
DROP POLICY IF EXISTS "authenticated_users_read_own" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_all" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_insert" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_update" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_delete" ON public.enrollment_users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.enrollment_users;
DROP POLICY IF EXISTS "Authenticated users can read their own record" ON public.enrollment_users;

-- Create new policies that work correctly

-- Allow authenticated users to read their own record by email
CREATE POLICY "authenticated_users_can_read_by_email"
  ON public.enrollment_users
  FOR SELECT
  USING (
    auth.jwt() IS NOT NULL 
    AND email = auth.jwt()->>'email'
  );

-- Allow service role full access (for admin operations)
CREATE POLICY "service_role_full_access"
  ON public.enrollment_users
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Allow admins to manage all users
CREATE POLICY "admins_can_manage_all"
  ON public.enrollment_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollment_users
      WHERE email = auth.jwt()->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );
