import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateTableRequest {
  entityName: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    unique: boolean;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { entityName, fields }: CreateTableRequest = await req.json();

    // Validate entity name (only allow lowercase letters, numbers, and underscores)
    if (!entityName.match(/^[a-z0-9_]+$/)) {
      throw new Error('Invalid entity name. Use only lowercase letters, numbers, and underscores.');
    }

    // Construct base table creation SQL
    let createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${entityName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMPTZ DEFAULT now(),
        created_by UUID NOT NULL REFERENCES auth.users(id)
    `;

    // Add custom fields
    if (fields && fields.length > 0) {
      for (const field of fields) {
        // Map field types to PostgreSQL types
        let sqlType;
        switch (field.type.toLowerCase()) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'url':
            sqlType = 'TEXT';
            break;
          case 'number':
            sqlType = 'NUMERIC';
            break;
          case 'date':
            sqlType = 'DATE';
            break;
          case 'datetime':
            sqlType = 'TIMESTAMPTZ';
            break;
          case 'boolean':
            sqlType = 'BOOLEAN';
            break;
          default:
            sqlType = 'TEXT';
        }

        createTableSQL += `,\n        ${field.name} ${sqlType}`;
        if (field.required) createTableSQL += ' NOT NULL';
        if (field.unique) createTableSQL += ' UNIQUE';
      }
    }

    createTableSQL += '\n      );';

    // Add RLS
    createTableSQL += `
      ALTER TABLE ${entityName} ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can read all ${entityName}"
        ON ${entityName} FOR SELECT
        TO authenticated
        USING (true);

      CREATE POLICY "Users can insert their own ${entityName}"
        ON ${entityName} FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = created_by);

      CREATE POLICY "Users can update their own ${entityName}"
        ON ${entityName} FOR UPDATE
        TO authenticated
        USING (auth.uid() = created_by)
        WITH CHECK (auth.uid() = created_by);

      CREATE POLICY "Users can delete their own ${entityName}"
        ON ${entityName} FOR DELETE
        TO authenticated
        USING (auth.uid() = created_by);
    `;

    // Execute the SQL
    const { error } = await supabaseClient.rpc('exec_sql', {
      sql: createTableSQL,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Table created successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});