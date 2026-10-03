import "server-only";
import { segredoDoSite } from "./segredo";
import { createHmac } from "node:crypto";
import { withTx, type Q } from "./db";

// Camada de integração com CRM externo (Blueprint §22, Modelo de Dados §42,
// §44 e §46). O banco do site já é o CRM operacional; esta camada só espelha
// os fatos para uma ferramenta externa (HubSpot, RD, ActiveCampaign, Make,
// Zapier...) por um webhook genérico assinado, sem acoplar o código a ela.
//
// Liga com CRM_WEBHOOK_URL. Sem a variável, nada é enfileirado.
// Cada envio leva o cabeçalho X-Epic-Signature: sha256=<hmac do corpo> com
// CRM_WEBHOOK_SECRET (ou EPIC_SECRET), e X-Epic-Event-Id para deduplicar.

const MAPA_EVENTOS: Record<string, string> = {
  StartMap: "map_started",
  CompleteMap: "map_completed",
  SubmitMapEmail: "lead_identified",
  NewsletterSignup: "lead_identified",
  ContactSubmitted: "lead_identified",
  MentoringInterest: "mentoring_interest",
  MentoringWaitlist: "mentoring_waitlist",
  StartCheckout: "checkout_started",
  Purchase: "purchase_approved",
  Refund: "refund",
  Unsubscribe: "unsubscribed",
};

export const crmLigado = () => Boolean(process.env.CRM_WEBHOOK_URL);

/** Chamado por registrarEvento quando o evento é novo. */
export async function enfileirarCrm(
  q: Q,
  evento: string,
  eventId: string,
  leadId: string | null | undefined,
  contexto: Record<string, unknown>
) {
  const tipo = MAPA_EVENTOS[evento];
  if (!tipo || !leadId || !crmLigado()) return;
  // Retrato do contato no momento do fato (payload mínimo de automação, §44).
  const [p] = await q<Record<string, unknown>>(
    `select lead_id, email, first_name, marketing_email_allowed, unsubscribed_at, lifecycle_stage, inactive_flag,
            last_map, maps_completed_count, first_primary_dimension, latest_primary_dimension,
            last_primary_pattern, last_secondary_pattern, first_product, last_product,
            plan_purchased, kit_purchased, protocol_purchased, mentoring_purchased, mentoring_interest,
            mentoring_waitlist, first_touch_source, first_touch_medium, first_touch_campaign,
            last_touch_source, last_touch_medium, last_touch_campaign,
            lifetime_revenue_gross, lifetime_revenue_net, customer_since
     from lead_profile where lead_id = $1`,
    [leadId]
  );
  if (!p) return;
  // Respostas individuais do Mapa nunca saem (§42): só tipo, padrões e faixa.
  await q("insert into crm_outbox (lead_id, event_type, payload) values ($1, $2, $3)", [
    leadId,
    tipo,
    JSON.stringify({ event: tipo, event_id: eventId, occurred_at: new Date().toISOString(), contact: p, context: contexto }),
  ]);
}

export interface RelatorioCrm {
  enviados: number;
  falhas: number;
}

/** Envia o que está pendente. Falha volta para a fila com espera crescente (até 6 tentativas). */
export async function enviarFilaCrm(limite = 50): Promise<RelatorioCrm> {
  const rel: RelatorioCrm = { enviados: 0, falhas: 0 };
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return rel;
  const segredo = process.env.CRM_WEBHOOK_SECRET || segredoDoSite();
  for (let i = 0; i < limite; i++) {
    const houve = await withTx(async (q) => {
      const [item] = await q<{ id: number; payload: Record<string, unknown>; retry_count: number }>(
        `select id, payload, retry_count from crm_outbox
         where processing_status = 'pending'
            or (processing_status = 'failed' and retry_count < 6
                and last_retry_at < now() - (interval '5 minutes' * power(2, retry_count)))
         order by id limit 1 for update skip locked`
      );
      if (!item) return false;
      const corpo = JSON.stringify(item.payload);
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Epic-Event-Id": String(item.payload.event_id ?? item.id),
            "X-Epic-Signature": `sha256=${createHmac("sha256", segredo).update(corpo).digest("hex")}`,
          },
          body: corpo,
          signal: AbortSignal.timeout(10_000),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        await q("update crm_outbox set processing_status = 'processed', sent_at = now(), processing_error = null where id = $1", [item.id]);
        rel.enviados++;
      } catch (e) {
        await q(
          `update crm_outbox set processing_status = 'failed', processing_error = $2, retry_count = retry_count + 1,
             last_retry_at = now() where id = $1`,
          [item.id, (e instanceof Error ? e.message : String(e)).slice(0, 300)]
        );
        rel.falhas++;
      }
      return true;
    });
    if (!houve) break;
  }
  return rel;
}
