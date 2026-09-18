import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceClient } from "@/lib/supabase";
import {
  COOKIE_ORIGEM,
  COOKIE_VISITANTE,
  TIPOS_EVENTO,
  parseOrigem,
  parseVisitante,
} from "@/lib/origem";

const TIPOS = new Set<string>(TIPOS_EVENTO);
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse/i;

/** Aparelho, sistema e se abriu pelo navegador interno de algum app. */
function perfilDoAparelho(ua: string) {
  const app = /Instagram/i.test(ua)
    ? "instagram"
    : /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)
      ? "facebook"
      : /TikTok|musical_ly|BytedanceWebview/i.test(ua)
        ? "tiktok"
        : /LinkedInApp/i.test(ua)
          ? "linkedin"
          : null;

  const sistema = /iPhone|iPad|iPod/i.test(ua)
    ? "ios"
    : /Android/i.test(ua)
      ? "android"
      : /Windows/i.test(ua)
        ? "windows"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "mac"
          : /CrOS/i.test(ua)
            ? "chromeos"
            : /Linux/i.test(ua)
              ? "linux"
              : null;

  const dispositivo =
    /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))
      ? "tablet"
      : /Mobi|iPhone|iPod|Android/i.test(ua)
        ? "celular"
        : "computador";

  return { app, sistema, dispositivo };
}

/** Localização aproximada que a Vercel já calcula. O IP não é guardado. */
function localizacao(h: Headers) {
  const dec = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v).slice(0, 80);
    } catch {
      return v.slice(0, 80);
    }
  };
  return {
    pais: dec(h.get("x-vercel-ip-country")),
    estado: dec(h.get("x-vercel-ip-country-region")),
    cidade: dec(h.get("x-vercel-ip-city")),
  };
}

/**
 * Registra eventos de origem e funil, com a origem lida do cookie.
 * Público por natureza (é chamado pelo navegador de qualquer visitante),
 * então aceita só tipos conhecidos, valida tudo e nunca devolve erro detalhado.
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

  const { tipo, pagina, etapa } = (body ?? {}) as {
    tipo?: unknown;
    pagina?: unknown;
    etapa?: unknown;
  };
  if (typeof tipo !== "string" || !TIPOS.has(tipo)) {
    return new NextResponse(null, { status: 400 });
  }
  const etapaNum =
    tipo === "quiz_etapa" && typeof etapa === "number" && Number.isInteger(etapa)
      ? etapa
      : null;
  if (tipo === "quiz_etapa" && (etapaNum === null || etapaNum < 1 || etapaNum > 50)) {
    return new NextResponse(null, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return new NextResponse(null, { status: 204 });

  const jar = await cookies();
  const origem = parseOrigem(jar.get(COOKIE_ORIGEM)?.value);

  const base = {
    tipo,
    visitante_id: parseVisitante(jar.get(COOKIE_VISITANTE)?.value),
    utm_source: origem?.utm_source ?? "direto",
    utm_medium: origem?.utm_medium ?? "",
    utm_campaign: origem?.utm_campaign ?? null,
    utm_content: origem?.utm_content ?? null,
    referrer: origem?.referrer ?? null,
    pagina: typeof pagina === "string" ? pagina.slice(0, 200) : null,
  };

  // Aparelho e local só na visita: é por ela que o perfil é contado.
  const extra =
    tipo === "visita"
      ? { ...perfilDoAparelho(ua), ...localizacao(request.headers) }
      : {};

  let { error } = await supabase
    .from("origem_eventos")
    .insert({ ...base, ...extra, etapa: etapaNum });

  if (error && (tipo === "visita" || tipo === "checkout")) {
    // As colunas do 004_funil.sql ainda não existem: grava o básico.
    ({ error } = await supabase.from("origem_eventos").insert(base));
  }

  if (error) {
    // Migration pendente ou banco fora do ar. O rastreio é best-effort.
    console.error("[origem] erro ao gravar:", error.message);
  }

  return new NextResponse(null, { status: 204 });
}
