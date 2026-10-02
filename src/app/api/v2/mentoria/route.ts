import { agendarAutomacao } from "@/lib/epic/server/automations";
import { registrarConsentimento, versaoPolitica } from "@/lib/epic/server/consent";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { caiuNaIsca, ehBot, erro, excedeuLimite, lerJson, logErro, ok } from "@/lib/epic/server/http";
import { garantirLead, identificar, sessaoAtual } from "@/lib/epic/server/identity";
import { capacidadeMentoria } from "@/lib/epic/server/produtos";
import { notificarEquipe } from "@/lib/epic/server/notificar";
import { NextResponse } from "next/server";
import { MENTORIA_FORM } from "@/lib/epic/content/mentoria";
import { EM_TRATATIVA, validarInteresse } from "@/lib/epic/mentoria";

/**
 * Interesse e lista de espera da Mentoria (RC1 §6, RF-034 a RF-036, RF-060,
 * AUT_MENTORING_INTEREST e AUT_MENTORING_WAITLIST). O estado vem da
 * capacidade real no momento do envio, não do que a página mostrava.
 * O envio não reserva vaga e não leva a checkout.
 */
export async function POST(req: Request) {
  if (ehBot(req)) return ok();
  if (await excedeuLimite(req, "mentoria", 5, 600)) {
    return erro("Muitas tentativas seguidas. Espere alguns minutos e tente novamente.", 429);
  }
  const b = await lerJson(req);
  if (!b) return erro(MENTORIA_FORM.falha);
  if (caiuNaIsca(b)) return ok();
  const v = validarInteresse(b);
  if (!v.ok) {
    return NextResponse.json(
      { ok: false, error: Object.values(v.erros)[0], campos: v.erros },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  const d = v.dados;

  try {
    const vagas = await capacidadeMentoria();
    const espera = !vagas.disponivel;
    const r = await withTx(async (q) => {
      const anon = await garantirLead(q, null);
      const lead = await identificar(q, anon, { email: d.email, firstName: d.nome.split(" ")[0] });
      // Consentimento para responder ao pedido e aceite de marketing ficam separados (RF-061).
      await registrarConsentimento(q, lead, "mentoring_form", d.marketing);
      const politica = await versaoPolitica(q);
      const [l] = await q<{ latest_primary_dimension: string | null }>(
        "select latest_primary_dimension from leads where lead_id = $1", [lead]
      );

      // Quem já tem uma conversa aberta não ganha outra linha: só completa a que existe.
      const [aberta] = await q<{ id: string; status: string }>(
        `select id, status from mentoring_applications
         where lead_id = $1 and status = any($2) order by created_at desc limit 1`,
        [lead, [...EM_TRATATIVA, "lista_espera", "ativo"]]
      );
      let candidatura: string;
      let nova = false;
      if (aberta) {
        candidatura = aberta.id;
        await q(
          `update mentoring_applications set name = $2, whatsapp = coalesce($3, whatsapp),
             context = coalesce($4, context), marketing_opt_in = marketing_opt_in or $5,
             privacy_policy_version = $6, updated_at = now()
           where id = $1`,
          [aberta.id, d.nome, d.whatsapp, d.contexto, d.marketing, politica]
        );
      } else {
        nova = true;
        const [ins] = await q<{ id: string }>(
          `insert into mentoring_applications (lead_id, name, email, whatsapp, context, kind, status,
             origin_dimension, marketing_opt_in, privacy_policy_version, status_changed_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
           returning id`,
          [lead, d.nome, d.email, d.whatsapp, d.contexto, espera ? "lista_espera" : "interesse",
            espera ? "lista_espera" : "novo", l?.latest_primary_dimension ?? null, d.marketing, politica]
        );
        candidatura = ins.id;
      }

      await q(
        `update leads set mentoring_interest = true,
           mentoring_waitlist = $2 or mentoring_waitlist,
           mentoring_waitlist_at = case when $2 then coalesce(mentoring_waitlist_at, now()) else mentoring_waitlist_at end
         where lead_id = $1`,
        [lead, espera && nova]
      );
      await q("select promote_lifecycle($1, 'mentoring_lead')", [lead]);
      // Sem nada do que a pessoa escreveu: só o fato e o estado.
      const sessao = await sessaoAtual();
      const event_id = await registrarEvento(q, "MentoringInterest", {
        lead_id: lead, session_id: sessao, product_id: "mentoring", product_type: "mentoring",
        props: { lista_de_espera: espera, tem_whatsapp: Boolean(d.whatsapp), tem_contexto: Boolean(d.contexto) },
      });
      if (espera && nova) {
        await registrarEvento(q, "MentoringWaitlist", { lead_id: lead, session_id: sessao, product_id: "mentoring" });
      }
      if (!espera) {
        // Durante a conversa, nada de automação de baixo ticket (Matriz §10).
        await q(
          `update messages set status = 'cancelled', skip_reason = 'tratativa_mentoria'
           where lead_id = $1 and status = 'scheduled' and automation_id in ('AUT_MAP_NURTURE','AUT_CHECKOUT_ABANDON')`,
          [lead]
        );
      }
      if (nova) {
        await agendarAutomacao(q, lead, espera ? "AUT_MENTORING_WAITLIST" : "AUT_MENTORING_INTEREST", {
          application_id: candidatura,
        });
      }
      return { event_id, nova };
    });
    void notificarEquipe(
      espera ? "Nova inscrição na lista de espera da Mentoria" : "Novo interesse na Mentoria",
      [
        `Nome: ${d.nome}`,
        `E-mail: ${d.email}`,
        `WhatsApp: ${d.whatsapp ?? "-"}`,
        `O que quer trabalhar: ${d.contexto ?? "-"}`,
        r.nova ? "Nova candidatura." : "Atualizou uma candidatura que já estava aberta.",
        "Acompanhe em /admin/epic/mentoria",
      ]
    );
    return ok({ event_id: r.event_id, lista_de_espera: espera });
  } catch (e) {
    logErro("v2/mentoria", e);
    return erro(MENTORIA_FORM.falha, 500);
  }
}
