// Origem do tráfego: de onde a pessoa veio (utm da bio do Instagram,
// stories, Google, acesso direto...). Guardada num cookie de 30 dias para
// sobreviver à navegação (o utm some da URL quando a pessoa vai para /quiz)
// e para contar o lead mesmo que ela volte dias depois.
//
// Este arquivo roda no navegador e no servidor. Não use APIs de DOM fora
// das funções marcadas como "navegador".

export const COOKIE_ORIGEM = "epic_origem";
export const COOKIE_VISITANTE = "epic_vid";

export interface Origem {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
}

const MAX = 120;

/** Corta, tira espaço e baixa a caixa. Evita lixo gigante no banco. */
function norm(v: string | null | undefined): string | null {
  const s = v?.trim().toLowerCase().slice(0, MAX);
  return s ? s : null;
}

/** Lê o cookie de origem (serve para navegador e servidor). */
export function parseOrigem(raw: string | null | undefined): Origem | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(decodeURIComponent(raw)) as Partial<Origem>;
    const utm_source = norm(o.utm_source);
    if (!utm_source) return null;
    return {
      utm_source,
      utm_medium: norm(o.utm_medium) ?? "",
      utm_campaign: norm(o.utm_campaign),
      utm_content: norm(o.utm_content),
      referrer: norm(o.referrer),
    };
  } catch {
    return null;
  }
}

/** Visitante anônimo: só um código aleatório, sem dado pessoal. */
export function parseVisitante(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  return v && /^[a-z0-9-]{8,64}$/i.test(v) ? v : null;
}

/** Deduz a origem pelo site de onde a pessoa veio, quando não há utm. */
function origemPeloReferrer(host: string): Pick<Origem, "utm_source" | "utm_medium"> {
  if (/instagram\./.test(host)) return { utm_source: "instagram", utm_medium: "referral" };
  if (/(^|\.)facebook\.|(^|\.)fb\.(me|com)$/.test(host))
    return { utm_source: "facebook", utm_medium: "referral" };
  if (/(^|\.)google\./.test(host)) return { utm_source: "google", utm_medium: "organic" };
  if (/(^|\.)(bing|duckduckgo|yahoo|ecosia)\./.test(host))
    return { utm_source: host.split(".").slice(-2, -1)[0] ?? host, utm_medium: "organic" };
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(host))
    return { utm_source: "x", utm_medium: "referral" };
  if (/linkedin\.|lnkd\.in/.test(host)) return { utm_source: "linkedin", utm_medium: "referral" };
  if (/youtube\.|youtu\.be/.test(host)) return { utm_source: "youtube", utm_medium: "referral" };
  return { utm_source: host.replace(/^www\./, ""), utm_medium: "referral" };
}

/* ─────────────────────────── navegador ─────────────────────────── */

function lerCookie(nome: string): string | null {
  const achou = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${nome}=`));
  return achou ? achou.slice(nome.length + 1) : null;
}

function gravarCookie(nome: string, valor: string, dias: number) {
  const expira = new Date(Date.now() + dias * 864e5).toUTCString();
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${nome}=${valor}; expires=${expira}; path=/; SameSite=Lax${seguro}`;
}

/** Origem atual guardada no cookie (navegador). */
export function origemAtual(): Origem | null {
  if (typeof document === "undefined") return null;
  return parseOrigem(lerCookie(COOKIE_ORIGEM));
}

/**
 * Descobre a origem desta visita e atualiza o cookie (navegador).
 *
 * Regra de atribuição: vale o último toque que NÃO é acesso direto.
 * - Veio com utm na URL: sempre sobrescreve.
 * - Veio de outro site (Google, Instagram sem utm...): sobrescreve.
 * - Acesso direto (digitou a URL, favorito): mantém a origem anterior,
 *   para não perder quem clicou na bio e voltou depois digitando.
 */
export function capturarOrigem(): void {
  if (typeof window === "undefined") return;

  if (!parseVisitante(lerCookie(COOKIE_VISITANTE))) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    gravarCookie(COOKIE_VISITANTE, id, 365);
  }

  const url = new URL(window.location.href);
  const q = url.searchParams;

  let refHost: string | null = null;
  try {
    if (document.referrer) {
      const h = new URL(document.referrer).hostname.toLowerCase();
      // Navegação dentro do próprio site não conta como origem.
      if (h && h !== url.hostname && !h.endsWith("epic247.com.br")) refHost = h;
    }
  } catch {
    /* referrer inválido: ignora */
  }

  let nova: Origem | null = null;

  if (q.get("utm_source")) {
    nova = {
      utm_source: norm(q.get("utm_source"))!,
      utm_medium: norm(q.get("utm_medium")) ?? "",
      utm_campaign: norm(q.get("utm_campaign")),
      utm_content: norm(q.get("utm_content")),
      referrer: refHost,
    };
  } else if (q.get("fbclid")) {
    // Clique vindo do Meta (Instagram ou Facebook) sem utm.
    nova = {
      utm_source: refHost?.includes("instagram") ? "instagram" : "meta",
      utm_medium: "clique",
      utm_campaign: null,
      utm_content: null,
      referrer: refHost,
    };
  } else if (refHost) {
    nova = { ...origemPeloReferrer(refHost), utm_campaign: null, utm_content: null, referrer: refHost };
  } else if (!origemAtual()) {
    nova = { utm_source: "direto", utm_medium: "", utm_campaign: null, utm_content: null, referrer: null };
  }

  if (nova) gravarCookie(COOKIE_ORIGEM, encodeURIComponent(JSON.stringify(nova)), 30);
}

/**
 * Link do checkout com a origem anexada, para o relatório de vendas do
 * Kiwify mostrar de onde veio cada venda (navegador).
 */
export function checkoutComOrigem(base: string): string {
  const o = origemAtual();
  if (!o) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", o.utm_source);
    if (o.utm_medium) url.searchParams.set("utm_medium", o.utm_medium);
    if (o.utm_campaign) url.searchParams.set("utm_campaign", o.utm_campaign);
    if (o.utm_content) url.searchParams.set("utm_content", o.utm_content);
    return url.toString();
  } catch {
    return base;
  }
}

/** Registra um evento de origem no nosso banco (navegador, best-effort). */
export function registrarEvento(tipo: "visita" | "checkout"): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ tipo, pagina: window.location.pathname });
  try {
    // sendBeacon sobrevive à troca de página (clique que leva ao Kiwify).
    if (tipo === "checkout" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/origem", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/origem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* rastreio nunca pode quebrar a página */
  }
}
