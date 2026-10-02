import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { interpretarKiwify, type EventoCheckout } from "../pagamentos/kiwify";
import type { Product } from "../products";

// Camada de checkout desacoplada (RF-042, Blueprint §21). A interface não
// sabe qual é o provedor: troca de Kiwify para outro = novo adapter aqui.

// O vocabulário (status interno, estado do pagamento, evento normalizado) e a
// tradução do payload ficam no adapter puro, testável fora do servidor.
export type { EstadoPagamento, EventoCheckout, StatusTransacao } from "../pagamentos/kiwify";

export interface ProvedorCheckout {
  nome: string;
  /** URL de checkout com rastreio para o webhook achar o lead e o Mapa. */
  montarUrl(p: Product, ctx: { leadId: string; mapResultId?: string | null; utm: Record<string, string | null> }): string;
  assinaturaValida(corpo: string, req: Request): boolean;
  interpretar(payload: Record<string, unknown>): EventoCheckout;
}

// ───────────────────────────── Kiwify ─────────────────────────────

export const kiwify: ProvedorCheckout = {
  nome: "kiwify",

  montarUrl(p, ctx) {
    const url = new URL(p.checkout_url!);
    // sck e src voltam no webhook em TrackingParameters: é como ligamos a
    // compra ao lead e ao Mapa sem depender do e-mail digitado no checkout.
    url.searchParams.set("sck", ctx.leadId);
    if (ctx.mapResultId) url.searchParams.set("src", ctx.mapResultId);
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const v = ctx.utm[k];
      if (v) url.searchParams.set(k, v);
    }
    return url.toString();
  },

  /**
   * O Kiwify assina com HMAC-SHA1 do corpo usando o token do webhook e manda
   * no parâmetro ?signature= da URL. Sem token configurado: só staging aceita.
   */
  assinaturaValida(corpo, req) {
    const token = process.env.KIWIFY_WEBHOOK_TOKEN;
    if (!token) return process.env.NEXT_PUBLIC_EPIC_ENV !== "production";
    const recebida = new URL(req.url).searchParams.get("signature") ?? "";
    const esperada = createHmac("sha1", token).update(corpo).digest("hex");
    const a = Buffer.from(recebida);
    const b = Buffer.from(esperada);
    return a.length === b.length && timingSafeEqual(a, b);
  },

  interpretar(p) {
    return interpretarKiwify(p);
  },
};

/** event_id determinístico por transação: reprocessar não duplica evento. */
export function eventIdDeTransacao(provider: string, transacao: string, tipo: string): string {
  const h = createHash("sha256").update(`${provider}:${transacao}:${tipo}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export const PROVEDOR = kiwify;
