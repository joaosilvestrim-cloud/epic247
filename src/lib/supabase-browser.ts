"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Cliente Supabase para o navegador (chave anônima). Usado em uploads via signed URL. */
export function getBrowserClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  }
  client = createClient(url, anon, {
    auth: { persistSession: false },
  });
  return client;
}
