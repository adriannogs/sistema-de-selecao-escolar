-- Fix infinite recursion in enrollment_users RLS policies
-- The problem: policies that query enrollment_users to check if user is admin
-- create infinite recursion when the query itself triggers RLS

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage enrollment users" ON public.enrollment_users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.enrollment_users;
DROP POLICY IF EXISTS "authenticated_users_read_own" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_all" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_insert" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_update" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_delete" ON public.enrollment_users;
DROP POLICY IF EXISTS "authenticated_users_can_read_by_email" ON public.enrollment_users;
DROP POLICY IF EXISTS "service_role_full_access" ON public.enrollment_users;
DROP POLICY IF EXISTS "admins_can_manage_all" ON public.enrollment_users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.enrollment_users;
DROP POLICY IF EXISTS "Authenticated users can read their own record" ON public.enrollment_users;

-- Create simple, non-recursive policies
-- These policies do NOT query enrollment_users, avoiding infinite recursion

-- Policy 1: Service role has full access (for backend operations)
CREATE POLICY "service_role_full_access"
  ON public.enrollment_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read by matching email
-- This is safe because it only uses auth.jwt() which doesn't query the table
CREATE POLICY "authenticated_read_by_email"
  ON public.enrollment_users
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt()->>'email'));

-- Policy 3: Allow public read access for setup check
-- This allows the /api/setup/check endpoint to work without authentication
CREATE POLICY "public_read_for_setup"
  ON public.enrollment_users
  FOR SELECT
  TO anon
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.enrollment_users TO anon;
GRANT SELECT ON public.enrollment_users TO authenticated;
GRANT ALL ON public.enrollment_users TO service_role;

-- Add helpful comment
COMMENT ON TABLE public.enrollment_users IS 
'RLS policies are intentionally simple to avoid infinite recursion. 
Admin authorization is checked in application code using service role, not in RLS policies.
The public_read_for_setup policy allows checking if admin exists during initial setup.';
