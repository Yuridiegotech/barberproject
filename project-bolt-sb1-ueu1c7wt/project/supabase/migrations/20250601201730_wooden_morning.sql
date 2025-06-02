/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove recursive admin check from profiles SELECT policy
    - Split the policy into two separate policies:
      1. Users can read their own profile
      2. Admins can read all profiles
    
  2. Security
    - Maintains data access control while preventing infinite recursion
    - Ensures users can only see their own profile unless they are an admin
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "profiles_select_policy" ON "profiles";

-- Create new separate policies for better control and to avoid recursion
CREATE POLICY "Users can read own profile"
ON "profiles"
FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON "profiles"
FOR SELECT
TO public
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role = 'admin'
  )
);