/*
  # Fix RLS policies for record creation

  1. Changes
    - Add missing policies for users table
    - Update account policies to be more specific
    - Add default policies for dynamically created tables
*/

-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update accounts" ON accounts;

-- Create updated policies for users table
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create updated policies for accounts table
CREATE POLICY "Users can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create default policies for all future tables
CREATE OR REPLACE FUNCTION create_default_policies()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
  WHERE command_tag = 'CREATE TABLE'
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
    
    -- Create standard policies
    EXECUTE format('
      CREATE POLICY "Users can read all records" ON %s
        FOR SELECT TO authenticated USING (true);
      
      CREATE POLICY "Users can insert own records" ON %s
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
      
      CREATE POLICY "Users can update own records" ON %s
        FOR UPDATE TO authenticated
        USING (auth.uid() = created_by)
        WITH CHECK (auth.uid() = created_by);
      
      CREATE POLICY "Users can delete own records" ON %s
        FOR DELETE TO authenticated USING (auth.uid() = created_by);
    ', obj.object_identity, obj.object_identity, obj.object_identity, obj.object_identity);
  END LOOP;
END;
$$;

-- Create event trigger for new tables
DROP EVENT TRIGGER IF EXISTS ensure_table_security;
CREATE EVENT TRIGGER ensure_table_security
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE PROCEDURE create_default_policies();