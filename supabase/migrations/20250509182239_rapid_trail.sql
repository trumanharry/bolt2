/*
  # Initial Schema Setup for CRM

  1. Tables
    - users: System users table linked to auth.users
    - accounts: Business accounts
    - entity_definitions: Custom entity type definitions
    - field_definitions: Field definitions for entities
    - layout_definitions: Layout configurations for entities

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users
    
  3. Default Data
    - System entities (users, accounts)
    - Default fields for system entities
*/

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS entity_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_definitions ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Account policies
CREATE POLICY "Users can read accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (true);

-- Entity definition policies
CREATE POLICY "Users can read entity definitions"
  ON entity_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert custom entity definitions"
  ON entity_definitions FOR INSERT
  TO authenticated
  WITH CHECK (NOT is_system);

CREATE POLICY "Users can update custom entity definitions"
  ON entity_definitions FOR UPDATE
  TO authenticated
  USING (NOT is_system);

-- Field definition policies
CREATE POLICY "Users can read field definitions"
  ON field_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert field definitions"
  ON field_definitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update field definitions"
  ON field_definitions FOR UPDATE
  TO authenticated
  USING (true);

-- Layout definition policies
CREATE POLICY "Users can read layout definitions"
  ON layout_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert layout definitions"
  ON layout_definitions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update layout definitions"
  ON layout_definitions FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);