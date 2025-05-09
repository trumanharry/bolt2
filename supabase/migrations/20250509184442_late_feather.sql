/*
  # Create exec_sql function

  1. New Functions
    - `exec_sql`: A function that allows executing dynamic SQL statements
      - Takes a SQL string as input
      - Returns void
      - Can only be executed by service_role users

  2. Security
    - Function is restricted to service_role users only
    - Cannot be executed by normal authenticated users
*/

-- Create function to execute dynamic SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Restrict access to service_role only
REVOKE ALL ON FUNCTION exec_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;