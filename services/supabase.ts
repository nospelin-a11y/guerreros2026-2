import { createClient } from '@supabase/supabase-js';

// Credenciales oficiales proporcionadas por el usuario
const supabaseUrl = 'https://fpiamcwjkvyjnjdnziwu.supabase.co';
const supabaseAnonKey = 'sb_publishable_MRkEpqR4A3Dpmn10I2rYEA_bsaHgwRC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);