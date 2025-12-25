import { createClient } from '@supabase/supabase-js';

// Las variables deben empezar por VITE_ para que Vite las exponga en el cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Si no hay credenciales, creamos un cliente dummy o manejamos el error graciosamente
// para que la app no se rompa al cargar, aunque las llamadas fallarán.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRÍTICO: Faltan las credenciales de Supabase en VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);