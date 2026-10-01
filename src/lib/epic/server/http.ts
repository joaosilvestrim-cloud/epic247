import "server-only";
import { NextResponse } from "next/server";
import { BOT_UA } from "./identity";

// Utilitários das rotas /api/v2. Erros nunca vazam detalhe nem PII (RF-067).

export function ok(body: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status, headers: { "Cache-Control": "no-store" } });
}

export function erro(mensagem: string, status = 400) {
  return NextResponse.json({ ok: false, error: mensagem }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function lerJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function ehBot(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

/** Campo-isca: humano não vê nem preenche. Robô de spam preenche. */
export function caiuNaIsca(body: Record<string, unknown>) {
  return typeof body.website === "string" && body.website.trim() !== "";
}

export function logErro(contexto: string, e: unknown) {
  // Só a mensagem técnica: nada de corpo de requisição, e-mail ou respostas.
  console.error(`[${contexto}]`, e instanceof Error ? e.message : String(e));
}

export const str = (v: unknown, n = 300) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
