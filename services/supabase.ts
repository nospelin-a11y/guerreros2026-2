
import { createClient } from '@supabase/supabase-js';

// Las variables deben empezar por VITE_ para que Vite las exponga en el cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your Environment Variables in Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
