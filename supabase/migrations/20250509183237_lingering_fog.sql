/*
  # Fix users table RLS policies

  1. Changes
    - Add insert policy for users table to allow authenticated users to create their own profile
    - This fixes the 403 error during signup

  2. Security
    - Users can only insert their own profile (id must match auth.uid())
*/

-- Add insert policy for users table
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);