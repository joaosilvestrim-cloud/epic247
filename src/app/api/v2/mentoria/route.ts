import { agendarAutomacao } from "@/lib/epic/server/automations";
import { registrarConsentimento } from "@/lib/epic/server/consent";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok, str } from "@/lib/epic/server/http";
import { emailValido, garantirLead, identificar, sessaoAtual } from "@/lib/epic/server/identity";
import { capacidadeMentoria } from "@/lib/epic/server/produtos";
import { notificarEquipe } from "@/lib/epic/server/notificar";

/** Interesse / lista de espera da Mentoria (RF-034 a RF-036, AUT_MENTORING_*). */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "mentoria", 5, 600)) return erro("Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", 429);
  const b = await lerJson(req);
  if (!b) return erro("Requisição inválida.");
  if (caiuNaIsca(b)) return ok();
  const nome = str(b.name, 120);
  if (!nome) return erro("Informe o seu nome.");
  if (!emailValido(b.email)) return erro("Confira o e-mail.");

  try {
    const vagas = await capacidadeMentoria();
    const espera = !vagas.disponivel;
    const r = await withTx(async (q) => {
      const anon = await garantirLead(q, null);
      const lead = await identificar(q, anon, { email: b.email as string, firstName: nome.split(" ")[0] });
      await registrarConsentimento(q, lead, "mentoring_form", b.marketing === true);
      const [l] = await q<{ latest_primary_dimension: string | null }>(
        "select latest_primary_dimension from leads where lead_id = $1", [lead]
      );
      await q(
        `insert into mentoring_applications (lead_id, name, email, challenge, desired_change, availability,
           origin_dimension, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [lead, nome, (b.email as string).toLowerCase(), str(b.challenge, 1000), str(b.desired_change, 1000),
          str(b.availability, 200), l?.latest_primary_dimension ?? null, espera ? "waitlist" : "new"]
      );
      await q(
        `update leads set mentoring_interest = true,
           mentoring_waitlist = $2 or mentoring_waitlist,
           mentoring_waitlist_at = case when $2 then coalesce(mentoring_waitlist_at, now()) else mentoring_waitlist_at end
         where lead_id = $1`,
        [lead, espera]
      );
      await q("select promote_lifecycle($1, 'mentoring_lead')", [lead]);
      const event_id = await registrarEvento(q, "MentoringInterest", {
        lead_id: lead, session_id: await sessaoAtual(), props: { lista_de_espera: espera },
      });
      // Durante a tratativa, nada de automação de baixo ticket (Matriz §10).
      await q(
        `update messages set status = 'cancelled', skip_reason = 'tratativa_mentoria'
         where lead_id = $1 and status = 'scheduled' and automation_id in ('AUT_MAP_NURTURE','AUT_CHECKOUT_ABANDON')`,
        [lead]
      );
      await agendarAutomacao(q, lead, espera ? "AUT_MENTORING_WAITLIST" : "AUT_MENTORING_INTEREST", {});
      return { event_id };
    });
    void notificarEquipe(
      espera ? "Nova inscrição na lista de espera da Mentoria" : "Novo interesse na Mentoria",
      [`Nome: ${nome}`, `E-mail: ${b.email}`, `Desafio: ${str(b.challenge, 1000) ?? "-"}`,
        `Mudança: ${str(b.desired_change, 1000) ?? "-"}`, `Disponibilidade: ${str(b.availability, 200) ?? "-"}`]
    );
    return ok({ ...r, lista_de_espera: espera });
  } catch (e) {
    logErro("v2/mentoria", e);
    return erro("Não foi possível enviar agora. Tente de novo em instantes.", 500);
  }
}
