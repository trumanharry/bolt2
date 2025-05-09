/*
  # Insert Default Data

  Creates default system entities and their fields:
  - Users entity with email, name, and avatar fields
  - Accounts entity with name, website, industry, and description fields
*/

-- Insert system entities
INSERT INTO entity_definitions (name, label, description, is_system, icon)
VALUES 
  ('users', 'Users', 'System users', true, 'user'),
  ('accounts', 'Accounts', 'Business accounts', true, 'building');

-- Insert default fields
DO $$
DECLARE
  users_entity_id UUID;
  accounts_entity_id UUID;
BEGIN
  -- Get entity IDs
  SELECT id INTO users_entity_id FROM entity_definitions WHERE name = 'users' LIMIT 1;
  SELECT id INTO accounts_entity_id FROM entity_definitions WHERE name = 'accounts' LIMIT 1;

  -- Insert user fields
  IF users_entity_id IS NOT NULL THEN
    INSERT INTO field_definitions (entity_id, name, label, type, is_required, display_order)
    VALUES 
      (users_entity_id, 'email', 'Email', 'email', true, 1),
      (users_entity_id, 'full_name', 'Full Name', 'text', false, 2),
      (users_entity_id, 'avatar_url', 'Avatar URL', 'url', false, 3);
  END IF;

  -- Insert account fields
  IF accounts_entity_id IS NOT NULL THEN
    INSERT INTO field_definitions (entity_id, name, label, type, is_required, display_order)
    VALUES 
      (accounts_entity_id, 'name', 'Account Name', 'text', true, 1),
      (accounts_entity_id, 'website', 'Website', 'url', false, 2),
      (accounts_entity_id, 'industry', 'Industry', 'text', false, 3),
      (accounts_entity_id, 'description', 'Description', 'textarea', false, 4);
  END IF;
END $$;