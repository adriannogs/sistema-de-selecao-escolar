-- Fix enrollment_users table RLS policies and add missing column
-- This script removes infinite recursion by simplifying RLS policies

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON enrollment_users;
DROP POLICY IF EXISTS "Admins can manage enrollment users" ON enrollment_users;
DROP POLICY IF EXISTS "Users can view own record" ON enrollment_users;
DROP POLICY IF EXISTS "Service role full access" ON enrollment_users;
DROP POLICY IF EXISTS "Admin users full access" ON enrollment_users;

-- Add missing created_by column
ALTER TABLE enrollment_users ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Create simple, non-recursive policies

-- Policy 1: Allow authenticated users to read their own record
-- This is safe because it only checks auth.uid() which doesn't query enrollment_users
CREATE POLICY "authenticated_users_read_own"
ON enrollment_users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Allow service role full access (for backend operations)
-- Service role bypasses RLS anyway, but this makes it explicit
CREATE POLICY "service_role_all"
ON enrollment_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Allow inserts for service role only
-- This prevents users from creating their own records
CREATE POLICY "service_role_insert"
ON enrollment_users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 4: Allow updates for service role only
CREATE POLICY "service_role_update"
ON enrollment_users
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 5: Allow deletes for service role only
CREATE POLICY "service_role_delete"
ON enrollment_users
FOR DELETE
TO service_role
USING (true);

-- Grant necessary permissions
GRANT SELECT ON enrollment_users TO authenticated;
GRANT ALL ON enrollment_users TO service_role;

-- Add comment explaining the approach
COMMENT ON TABLE enrollment_users IS 'User management table. RLS policies are intentionally simple to avoid recursion. Admin authorization is checked in application code, not in RLS policies.';
