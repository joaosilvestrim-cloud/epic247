import "server-only";
import { randomUUID } from "node:crypto";
import type { Q } from "./db";
import { enfileirarCrm } from "./crm";

// Taxonomia core (Modelo de Dados §15, RF-026). Só estes nomes entram.
export const EVENTOS_CORE = [
  "ViewHome", "ViewDimensionPage", "ViewMapEntry", "StartMap", "MapQuestionProgress",
  "CompleteMap", "ViewMapResult", "SubmitMapEmail", "ViewPlanOffer", "PurchasePlan",
  "ViewKitOffer", "PurchaseKit", "ViewProtocolOffer", "PurchaseProtocol", "ViewMentoring",
  "MentoringInterest", "StartCheckout", "Purchase", "Refund", "Unsubscribe",
] as const;
// Eventos de automação (§17): só o servidor emite.
export const EVENTOS_AUTOMACAO = [
  "ResultEmailSent", "MapNurtureStarted", "MapNurtureConversion", "PlanDelivered",
  "PlanDay7Completed", "KitDelivered", "ProtocolActivated", "MentoringBooked",
  "RecoveredCheckout", "CrossDimensionMapStarted", "ResumeMap", "NewsletterSignup", "ContactSubmitted",
  "ResultEmailOpened", "ResultEmailClicked", "ResultFeedback", "LifecycleChanged",
  // Mentoria piloto (RC1 §6, Funis §54): lista de espera, link liberado e compra.
  "MentoringWaitlist", "MentoringPaymentLinkSent", "PurchaseMentoring",
] as const;

// Pagamento (Modelo de Dados §65, RC1 §11): só o webhook do provedor emite.
export const EVENTOS_PAGAMENTO = ["PaymentWaiting", "PaymentRefused", "Chargeback"] as const;

export type EventoCore = (typeof EVENTOS_CORE)[number];
export type EventoNome = EventoCore | (typeof EVENTOS_AUTOMACAO)[number] | (typeof EVENTOS_PAGAMENTO)[number];

/** Eventos que o navegador pode registrar. Compras e e-mails só pelo servidor. */
export const EVENTOS_DO_NAVEGADOR = new Set<string>([
  "ViewHome", "ViewDimensionPage", "ViewMapEntry", "ViewPlanOffer", "ViewKitOffer",
  "ViewProtocolOffer", "ViewMentoring", "MapQuestionProgress", "ViewMapResult", "ViewMapEntry",
]);

export interface DadosEvento {
  event_id?: string;
  lead_id?: string | null;
  session_id?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  map_type?: string | null;
  dimension?: string | null;
  primary_pattern?: string | null;
  secondary_pattern?: string | null;
  product_id?: string | null;
  product_type?: string | null;
  product_price?: number | null;
  transaction_id?: string | null;
  question_index?: number | null;
  props?: Record<string, unknown> | null;
}

/** Grava o evento. event_id repetido é ignorado (deduplicação, RF-028). */
export async function registrarEvento(q: Q, nome: EventoNome, d: DadosEvento): Promise<string> {
  const id = d.event_id ?? randomUUID();
  const novo = await q(
    `insert into events (event_id, event_name, lead_id, session_id, page_url, referrer,
       utm_source, utm_medium, utm_campaign, utm_content, utm_term, map_type, dimension,
       primary_pattern, secondary_pattern, product_id, product_type, product_price,
       transaction_id, question_index, props, external_campaign_id, external_adset_id, external_ad_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
       -- IDs externos de mídia (§55) herdados da sessão, quando ela os trouxe.
       (select external_campaign_id from sessions where session_id = $4),
       (select external_adset_id from sessions where session_id = $4),
       (select external_ad_id from sessions where session_id = $4))
     on conflict (event_id) do nothing
     returning event_id`,
    [
      id, nome, d.lead_id ?? null, d.session_id ?? null, d.page_url ?? null, d.referrer ?? null,
      d.utm_source ?? null, d.utm_medium ?? null, d.utm_campaign ?? null, d.utm_content ?? null,
      d.utm_term ?? null, d.map_type ?? null, d.dimension ?? null, d.primary_pattern ?? null,
      d.secondary_pattern ?? null, d.product_id ?? null, d.product_type ?? null,
      d.product_price ?? null, d.transaction_id ?? null, d.question_index ?? null,
      d.props ? JSON.stringify(d.props) : null,
    ]
  );
  // Só fatos novos seguem para o CRM externo (replay do mesmo evento não duplica).
  if (novo.length) {
    await enfileirarCrm(q, nome, id, d.lead_id, {
      map_type: d.map_type ?? null, dimension: d.dimension ?? null,
      primary_pattern: d.primary_pattern ?? null, secondary_pattern: d.secondary_pattern ?? null,
      product_id: d.product_id ?? null, product_type: d.product_type ?? null,
      product_price: d.product_price ?? null, transaction_id: d.transaction_id ?? null,
      utm_source: d.utm_source ?? null, utm_campaign: d.utm_campaign ?? null, utm_content: d.utm_content ?? null,
      ...(d.props?.tipo ? { tipo: d.props.tipo } : {}),
    });
  }
  return id;
}
