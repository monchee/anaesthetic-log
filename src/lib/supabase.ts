import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient | null = null;

if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
  supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
}

export { supabase };
export const isSupabaseConfigured = supabase !== null;
