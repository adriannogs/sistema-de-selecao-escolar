-- Fix access_codes RLS policies to prevent infinite recursion
-- The problem: The "Admins can manage access codes" policy queries enrollment_users,
-- which can trigger RLS policies that create infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage access codes" ON access_codes;
DROP POLICY IF EXISTS "Anyone can validate access codes" ON access_codes;
DROP POLICY IF EXISTS "service_role_full_access_codes" ON access_codes;
DROP POLICY IF EXISTS "public_read_access_codes" ON access_codes;

-- Create simple, non-recursive policies

-- Policy 1: Service role has full access (for backend operations)
-- This is used by API routes that use the service role key
CREATE POLICY "service_role_full_access_codes"
  ON access_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read access codes (for validation)
-- This allows the public enrollment form to validate codes
CREATE POLICY "public_read_access_codes"
  ON access_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON access_codes TO anon;
GRANT SELECT ON access_codes TO authenticated;
GRANT ALL ON access_codes TO service_role;

-- Add helpful comment
COMMENT ON TABLE access_codes IS 
'RLS policies are intentionally simple to avoid infinite recursion. 
Admin authorization for managing codes is checked in application code using service role, not in RLS policies.
Public users can read codes for validation purposes only.';
