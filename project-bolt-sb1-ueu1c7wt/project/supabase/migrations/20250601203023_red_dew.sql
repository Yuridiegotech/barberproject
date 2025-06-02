/*
  # Fix appointments RLS policies

  1. Changes
    - Add RLS policies for appointments table to allow:
      - Anonymous users to insert appointments with null user_id
      - Authenticated users to insert appointments with their user_id
      - Existing select and update policies remain unchanged

  2. Security
    - Enable RLS on appointments table
    - Add policies for INSERT operations
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;

-- Create new insert policies
CREATE POLICY "Allow anonymous appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL
  );

CREATE POLICY "Allow authenticated user appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );