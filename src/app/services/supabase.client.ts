import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Single shared Supabase client instance for the whole app.
 * Reads the project URL + anon key from environment.ts.
 */
export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
