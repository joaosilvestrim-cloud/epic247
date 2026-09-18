import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import {
  COOKIE_ORIGEM,
  COOKIE_VISITANTE,
  parseOrigem,
  parseVisitante,
} from "@/lib/origem";

const TIPOS = new Set(["visita", "checkout"]);
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;

/**
 * Registra visita ou clique em comprar, com a origem lida do cookie.
 * Público por natureza (é chamado pelo navegador de qualquer visitante),
 * então aceita só dois tipos, valida tudo e nunca devolve erro detalhado.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { tipo, pagina } = (body ?? {}) as { tipo?: unknown; pagina?: unknown };
  if (typeof tipo !== "string" || !TIPOS.has(tipo)) {
    return new NextResponse(null, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const jar = await cookies();
  const origem = parseOrigem(jar.get(COOKIE_ORIGEM)?.value);
  const visitante = parseVisitante(jar.get(COOKIE_VISITANTE)?.value);

  const { error } = await supabase.from("origem_eventos").insert({
    tipo,
    visitante_id: visitante,
    utm_source: origem?.utm_source ?? "direto",
    utm_medium: origem?.utm_medium ?? "",
    utm_campaign: origem?.utm_campaign ?? null,
    utm_content: origem?.utm_content ?? null,
    referrer: origem?.referrer ?? null,
    pagina: typeof pagina === "string" ? pagina.slice(0, 200) : null,
  });

  if (error) {
    // Tabela ainda não criada (supabase/003_origem.sql não rodou) ou banco
    // fora do ar. O rastreio é best-effort: o site segue normal.
    console.error("[origem] erro ao gravar:", error.message);
  }

  return new NextResponse(null, { status: 204 });
}
