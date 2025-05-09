/*
  # System Tables for CRM

  1. New Tables
    - `users`: Stores user profile information linked to auth.users
    - `accounts`: Stores account records 
    - `entity_definitions`: Defines entity types that can be created in the system
    - `field_definitions`: Defines fields for each entity
    - `layout_definitions`: Defines customizable layouts for entity records
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT
);

-- Create entity definitions table
CREATE TABLE IF NOT EXISTS entity_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create field definitions table
CREATE TABLE IF NOT EXISTS field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entity_definitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  default_value JSONB,
  options JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entity_id, name)
);

-- Create layout definitions table
CREATE TABLE IF NOT EXISTS layout_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES entity_definitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  definition JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE (entity_id, type, name)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for accounts table
CREATE POLICY "Users can read accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for entity_definitions table
CREATE POLICY "Users can read entity definitions"
  ON entity_definitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert custom entity definitions"
  ON entity_definitions
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT is_system);

CREATE POLICY "Users can update custom entity definitions"
  ON entity_definitions
  FOR UPDATE
  TO authenticated
  USING (NOT is_system);

-- Create policies for field_definitions table
CREATE POLICY "Users can read field definitions"
  ON field_definitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert field definitions"
  ON field_definitions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update field definitions"
  ON field_definitions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for layout_definitions table
CREATE POLICY "Users can read layout definitions"
  ON layout_definitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert layout definitions"
  ON layout_definitions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update layout definitions"
  ON layout_definitions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Insert default entity definitions
INSERT INTO entity_definitions (id, name, label, description, is_system, icon)
VALUES 
  (gen_random_uuid(), 'users', 'Users', 'System users', true, 'user'),
  (gen_random_uuid(), 'accounts', 'Accounts', 'Business accounts', true, 'building');

-- Get the entity IDs
DO $$
DECLARE
  users_entity_id UUID;
  accounts_entity_id UUID;
BEGIN
  SELECT id INTO users_entity_id FROM entity_definitions WHERE name = 'users';
  SELECT id INTO accounts_entity_id FROM entity_definitions WHERE name = 'accounts';

  -- Insert default field definitions for users
  INSERT INTO field_definitions (entity_id, name, label, type, is_required, display_order)
  VALUES 
    (users_entity_id, 'email', 'Email', 'email', true, 1),
    (users_entity_id, 'full_name', 'Full Name', 'text', false, 2),
    (users_entity_id, 'avatar_url', 'Avatar URL', 'url', false, 3);

  -- Insert default field definitions for accounts
  INSERT INTO field_definitions (entity_id, name, label, type, is_required, display_order)
  VALUES 
    (accounts_entity_id, 'name', 'Account Name', 'text', true, 1),
    (accounts_entity_id, 'website', 'Website', 'url', false, 2),
    (accounts_entity_id, 'industry', 'Industry', 'text', false, 3),
    (accounts_entity_id, 'description', 'Description', 'textarea', false, 4);
END $$;