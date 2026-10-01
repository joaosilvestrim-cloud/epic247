"use client";

// Rastreamento do lado do navegador (EPIC247 2.0).
// Cada evento leva um event_id: o mesmo id vai para o nosso banco e para o
// Pixel (eventID), e é reaproveitado pela Conversions API, então o Meta
// deduplica em vez de contar duas vezes (RF-028).

type Dados = Record<string, unknown>;

interface Win extends Window {
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
}

/** Nome core → evento padrão do Meta (os demais vão como trackCustom). */
const META_PADRAO: Record<string, string> = {
  SubmitMapEmail: "Lead",
  StartCheckout: "InitiateCheckout",
  ViewPlanOffer: "ViewContent",
  ViewKitOffer: "ViewContent",
  ViewProtocolOffer: "ViewContent",
  CompleteMap: "CompleteRegistration",
  MentoringInterest: "Contact",
};

const snake = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

export function novoEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
      );
}

/** Espelha um evento no Pixel e no GA4. Não grava no banco. */
export function espelhar(nome: string, eventId: string, dados: Dados = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  try {
    const params = { ...dados, event_id: eventId };
    const padrao = META_PADRAO[nome];
    if (padrao) w.fbq?.("track", padrao, params, { eventID: eventId });
    else w.fbq?.("trackCustom", nome, params, { eventID: eventId });
    w.gtag?.("event", snake(nome), params);
  } catch {
    /* rastreio nunca quebra a página */
  }
}

/** Evento de navegação: grava no banco (whitelist do servidor) e espelha. */
export function rastrear(nome: string, dados: Dados = {}) {
  if (typeof window === "undefined") return;
  const event_id = novoEventId();
  espelhar(nome, event_id, dados);
  const corpo = JSON.stringify({
    event_name: nome,
    event_id,
    page_url: window.location.pathname,
    referrer: document.referrer || null,
    ...dados,
  });
  try {
    if (nome === "StartCheckout" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/v2/evento", new Blob([corpo], { type: "application/json" }));
      return;
    }
    void fetch("/api/v2/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: corpo,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* idem */
  }
}

/** Abre/atualiza a sessão no servidor com a origem desta visita. */
export function registrarSessao() {
  if (typeof window === "undefined") return;
  const q = new URL(window.location.href).searchParams;
  const corpo = {
    utm_source: q.get("utm_source"),
    utm_medium: q.get("utm_medium"),
    utm_campaign: q.get("utm_campaign"),
    utm_content: q.get("utm_content"),
    utm_term: q.get("utm_term"),
    landing_page: window.location.pathname,
    referrer: document.referrer || null,
  };
  return fetch("/api/v2/sessao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    keepalive: true,
  }).catch(() => {});
}

/** POST JSON para as rotas v2. Lança com a mensagem amigável do servidor. */
export async function enviar<T = Record<string, unknown>>(url: string, corpo: Dados): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const d = (await r.json().catch(() => null)) as (T & { ok?: boolean; error?: string }) | null;
  if (!r.ok || !d || d.ok === false) throw new Error(d?.error ?? "Algo deu errado. Tente de novo.");
  return d;
}
