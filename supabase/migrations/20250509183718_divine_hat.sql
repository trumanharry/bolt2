/*
  # Create hospitals table

  1. New Tables
    - `hospitals`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `address` (text, required)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `created_at` (timestamp with time zone)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on `hospitals` table
    - Add policies for:
      - Authenticated users can read all hospitals
      - Users can only create/update/delete hospitals they created
*/

-- Create the hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  website text,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all hospitals"
  ON hospitals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own hospitals"
  ON hospitals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own hospitals"
  ON hospitals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own hospitals"
  ON hospitals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);