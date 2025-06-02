/*
  # Add RLS policy for rewards table

  1. Security
    - Add policy for authenticated users to insert their own rewards
*/

CREATE POLICY "Users can insert their own rewards"
  ON rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);