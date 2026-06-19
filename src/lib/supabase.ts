import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso no SERVIDOR (rota /api/lead).
 * Usa a Service Role Key para gravar leads ignorando RLS.
 * NUNCA importe este módulo em componentes de cliente.
 */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
