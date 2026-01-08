import { createClient } from '@supabase/supabase-js';

// Variables de entorno - usar las de Vercel en producción
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vnefocljtdvkabfxwoqg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_LfbMTu3UV0dPk7p9hy98sA_oRRKfiGU';

// Crear cliente de Supabase (usando la clave pública/anónima para el cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

