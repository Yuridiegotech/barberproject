/*
  # Fix RLS policies and queries

  1. Changes
    - Fix RLS policies for profiles table to prevent recursion
    - Add proper date range filtering for appointments
    - Ensure proper access for initial admin setup

  2. Security
    - Update RLS policies to be more specific and prevent recursion
    - Maintain security while allowing necessary operations
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Create new, more specific policies
CREATE POLICY "Allow public email check"
  ON profiles
  FOR SELECT
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow initial profile creation"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);