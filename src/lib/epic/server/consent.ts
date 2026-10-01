import "server-only";
import type { Q } from "./db";

// Consentimento (RF-061 a RF-063, Matriz AUT_EMAIL_CONSENT).
// Regra: aceitar receber o resultado NÃO é aceitar marketing. Os dois são
// registrados separados, com origem, horário e versão da política.

export async function versaoPolitica(q: Q): Promise<string> {
  const [row] = await q<{ value: string }>("select value from app_settings where key = 'privacy_policy_version'");
  return row?.value ?? "2026-10-01";
}

export async function registrarConsentimento(
  q: Q,
  leadId: string,
  origem: "map_result" | "newsletter_form" | "checkout" | "mentoring_form" | "contact_form",
  marketing: boolean
) {
  const versao = await versaoPolitica(q);
  await q(
    `update leads set
       email_consent = true,
       email_consent_at = coalesce(email_consent_at, now()),
       email_consent_source = coalesce(email_consent_source, $2),
       privacy_policy_version = $3,
       -- marketing só liga com aceite explícito; nunca desliga um aceite anterior por omissão
       marketing_email_allowed = marketing_email_allowed or $4,
       unsubscribed_at = case when $4 then null else unsubscribed_at end
     where lead_id = $1`,
    [leadId, origem, versao, marketing]
  );
}
