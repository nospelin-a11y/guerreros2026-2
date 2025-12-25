
import { createClient } from '@supabase/supabase-js';

// Reemplaza estas URLs con las de tu proyecto de Supabase
// En Vercel, deberás añadirlas como Variables de Entorno (Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
