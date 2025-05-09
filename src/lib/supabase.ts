import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These will be replaced with actual environment variables in a production environment
// For this demo, we're using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);