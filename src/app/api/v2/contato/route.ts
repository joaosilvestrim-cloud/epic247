import { ASSUNTOS, ehAssunto } from "@/lib/epic/content/contato";
import { registrarConsentimento, versaoPolitica } from "@/lib/epic/server/consent";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { emailValido, garantirLead, identificar, sessaoAtual } from "@/lib/epic/server/identity";
import { notificarEquipe } from "@/lib/epic/server/notificar";

/** Só o caminho da página de origem: querystring pode carregar dado pessoal. */
function caminhoDeOrigem(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  try {
    return new URL(v).pathname.slice(0, 200);
  } catch {
    return null;
  }
}

/**
 * Formulário de contato (RF-059, RF-065, Copy Final §24): assunto roteado,
 * WhatsApp opcional, aceite de marketing separado do necessário para responder.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "contato", 5, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  if (caiuNaIsca(b)) return ok();
  const nome = str(b.name, 120);
  const mensagem = str(b.message, 3000);
  if (!nome) return erro("Digite seu nome.");
  if (!emailValido(b.email)) return erro("Digite um e-mail válido.");
  if (!mensagem) return erro("Conte brevemente como podemos ajudar.");
  const topico = ehAssunto(b.topic) ? b.topic : "outro";
  const assunto = str(b.subject, 150) ?? ASSUNTOS[topico];
  const whatsapp = str(b.whatsapp, 30);
  const origem = caminhoDeOrigem(b.origin);
  try {
    await withTx(async (q) => {
      const anon = await garantirLead(q, null);
      const lead = await identificar(q, anon, { email: b.email as string, firstName: nome.split(" ")[0] });
      await registrarConsentimento(q, lead, "contact_form", b.marketing === true);
      await q(
        `insert into contact_messages (lead_id, name, email, subject, message, topic, whatsapp, origin_path, privacy_policy_version)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [lead, nome, (b.email as string).toLowerCase(), assunto, mensagem, topico, whatsapp, origem, await versaoPolitica(q)]
      );
      // Assunto e origem vão para o evento (e daí para o CRM); a mensagem não.
      await registrarEvento(q, "ContactSubmitted", {
        lead_id: lead,
        session_id: await sessaoAtual(),
        props: { topic: topico, origin_path: origem },
      });
    });
    void notificarEquipe(`Contato · ${ASSUNTOS[topico]}`, [
      `Nome: ${nome}`,
      `E-mail: ${b.email}`,
      ...(whatsapp ? [`WhatsApp: ${whatsapp}`] : []),
      "",
      mensagem,
    ]);
    return ok();
  } catch (e) {
    logErro("v2/contato", e);
    return erro("Não conseguimos enviar sua mensagem agora.", 500);
  }
}
