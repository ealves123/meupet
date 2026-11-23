import { createClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase. Fica null enquanto as variáveis não estiverem configuradas,
 * e o app segue usando o armazenamento local (store.ts).
 * Use só a chave publishable aqui: a secret/service_role ignora as regras de acesso.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
export const hasSupabase = supabase != null;
