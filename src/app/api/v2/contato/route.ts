import { registrarConsentimento } from "@/lib/epic/server/consent";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { emailValido, garantirLead, identificar, sessaoAtual } from "@/lib/epic/server/identity";
import { notificarEquipe } from "@/lib/epic/server/notificar";

/** Formulário de contato (RF-059, RF-065). */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "contato", 5, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  if (caiuNaIsca(b)) return ok();
  const nome = str(b.name, 120);
  const mensagem = str(b.message, 3000);
  if (!nome) return erro("Informe o seu nome.");
  if (!emailValido(b.email)) return erro("Confira o e-mail.");
  if (!mensagem) return erro("Escreva a sua mensagem.");
  const assunto = str(b.subject, 150);
  try {
    await withTx(async (q) => {
      const anon = await garantirLead(q, null);
      const lead = await identificar(q, anon, { email: b.email as string, firstName: nome.split(" ")[0] });
      await registrarConsentimento(q, lead, "contact_form", false);
      await q(
        "insert into contact_messages (lead_id, name, email, subject, message) values ($1,$2,$3,$4,$5)",
        [lead, nome, (b.email as string).toLowerCase(), assunto, mensagem]
      );
      await registrarEvento(q, "ContactSubmitted", { lead_id: lead, session_id: await sessaoAtual() });
    });
    void notificarEquipe(`Contato: ${assunto ?? "sem assunto"}`, [`Nome: ${nome}`, `E-mail: ${b.email}`, "", mensagem]);
    return ok();
  } catch (e) {
    logErro("v2/contato", e);
    return erro("Não foi possível enviar agora. Tente de novo em instantes.", 500);
  }
}
