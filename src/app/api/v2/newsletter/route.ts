import { registrarConsentimento } from "@/lib/epic/server/consent";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { emailValido, garantirLead, identificar, sessaoAtual } from "@/lib/epic/server/identity";
import { agendarAutomacao } from "@/lib/epic/server/automations";

/** Inscrição na newsletter: e-mail + aceite explícito de marketing. */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "newsletter", 5, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  if (caiuNaIsca(b)) return ok();
  if (!emailValido(b.email)) return erro("Confira o e-mail.");
  if (b.consent !== true) return erro("Para receber a newsletter, marque o aceite.");
  try {
    await withTx(async (q) => {
      const anon = await garantirLead(q, null);
      const lead = await identificar(q, anon, { email: b.email as string, firstName: str(b.first_name, 80) });
      await registrarConsentimento(q, lead, "newsletter_form", true);
      await q("select promote_lifecycle($1, 'identified_lead')", [lead]);
      await registrarEvento(q, "NewsletterSignup", { lead_id: lead, session_id: await sessaoAtual() });
      await agendarAutomacao(q, lead, "AUT_NEWSLETTER_WELCOME", {});
    });
    return ok();
  } catch (e) {
    logErro("v2/newsletter", e);
    return erro("Não foi possível concluir agora. Tente de novo em instantes.", 500);
  }
}
