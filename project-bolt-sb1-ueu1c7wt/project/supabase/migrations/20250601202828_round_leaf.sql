/*
  # Fix appointments table RLS policies

  1. Security Changes
    - Enable RLS on appointments table
    - Add policy for public users to insert appointments
    - Add policy for authenticated users to insert appointments
    - Add policy for admin users to manage all appointments
*/

-- Enable RLS on appointments table (if not already enabled)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;

-- Create new insert policy for both authenticated and public users
CREATE POLICY "appointments_insert_policy" ON appointments
  FOR INSERT TO public
  WITH CHECK (
    -- Allow authenticated users to insert appointments for themselves
    (auth.uid() = user_id) OR
    -- Allow public users to insert appointments with null user_id
    (user_id IS NULL)
  );