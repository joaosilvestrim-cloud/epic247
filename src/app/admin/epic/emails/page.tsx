import Link from "next/link";
import { brl, Cartao, dataHora, FiltroPeriodo, pct, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { cancelarMensagem, dispararAgora } from "../actions";
import { DIAS_PERIODO, exigirAdmin, kpisAutomacao, periodoDe } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { AUTOMACOES } from "@/lib/epic/server/automations";

type Props = { searchParams: Promise<{ p?: string; s?: string; a?: string }> };

const NOME: Record<string, string> = {
  AUT_MAP_RESULT_DELIVERY: "Entrega do resultado do Mapa",
  AUT_MAP_NURTURE: "Sequência pós-Mapa (D1 a D7)",
  AUT_MAP_ABANDON_IDENTIFIED: "Mapa não concluído",
  AUT_PLAN_PURCHASE: "Compra do Plano",
  AUT_KIT_PURCHASE: "Compra do Kit",
  AUT_PROTOCOL_PURCHASE: "Compra do Protocolo",
  AUT_MENTORING_INTEREST: "Candidatura à Mentoria",
  AUT_MENTORING_WAITLIST: "Lista de espera da Mentoria",
  AUT_MENTORING_PURCHASE: "Compra da Mentoria",
  AUT_CHECKOUT_ABANDON: "Checkout abandonado",
  AUT_INACTIVE_30D: "Reativação (30 dias)",
  AUT_PLAN_READY: "Plano pronto",
  AUT_NEWSLETTER_WELCOME: "Boas-vindas da newsletter",
  AUT_NEWSLETTER_EDITION: "Edição da newsletter",
  AUT_CROSS_DIMENSION: "Convite para dimensão relacionada",
};

const SITUACOES = ["scheduled", "sent", "skipped", "cancelled", "failed"] as const;
const ROTULO: Record<string, string> = {
  scheduled: "na fila", sent: "enviado", skipped: "pulado", cancelled: "cancelado", failed: "falhou",
};
const TOM: Record<string, "bom" | "alerta" | "ruim" | "neutro"> = {
  scheduled: "alerta", sent: "bom", skipped: "neutro", cancelled: "neutro", failed: "ruim",
};

/** Fila do motor de automações (RF-074 a RF-080). */
export default async function EmailsPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const desde = new Date(Date.now() - DIAS_PERIODO[periodo] * 864e5).toISOString();
  const situacao = SITUACOES.find((x) => x === sp.s) ?? null;
  const automacao = sp.a && sp.a in AUTOMACOES ? sp.a : null;
  const modo = process.env.EPIC_EMAIL_MODE === "live" ? "live" : "simulate";

  const [porAutomacao, motivos, fila, kpis] = await Promise.all([
    query<Record<string, string>>(
      `select automation_id,
              count(*) filter (where status = 'scheduled') fila,
              count(*) filter (where status = 'sent') enviados,
              count(*) filter (where status = 'sent' and delivery_mode = 'simulated') simulados,
              count(*) filter (where status = 'skipped') pulados,
              count(*) filter (where status = 'cancelled') cancelados,
              count(*) filter (where status = 'failed') falhas,
              count(*) filter (where opened_at is not null) abertos,
              count(*) filter (where clicked_at is not null) cliques,
              count(*) filter (where bounced_at is not null or complained_at is not null) devolvidos
       from messages where created_at >= $1 group by 1 order by 1`,
      [desde]
    ),
    query<{ skip_reason: string; n: string }>(
      `select coalesce(skip_reason, '—') skip_reason, count(*) n from messages
       where created_at >= $1 and status in ('skipped','cancelled') group by 1 order by 2 desc limit 12`,
      [desde]
    ),
    query<Record<string, string | number | null>>(
      `select m.message_id, m.lead_id, l.email, m.automation_id, m.step, m.template_key, m.priority, m.status, m.skip_reason,
              m.scheduled_for, m.sent_at, m.subject, m.delivery_mode, m.error, m.postponed_count
       from messages m left join leads l using (lead_id)
       where m.created_at >= $1 and ($2::text is null or m.status = $2) and ($3::text is null or m.automation_id = $3)
       order by case when m.status = 'scheduled' then 0 else 1 end, m.scheduled_for desc limit 150`,
      [desde, situacao, automacao]
    ),
    kpisAutomacao(periodo),
  ]);

  const tot = (k: string) => porAutomacao.reduce((a, r) => a + Number(r[k]), 0);
  const vencidas = fila.filter((m) => m.status === "scheduled" && new Date(m.scheduled_for as string) <= new Date()).length;
  const filtro = (extra: Record<string, string | null>) => {
    const u = new URLSearchParams({ p: periodo });
    const all = { s: situacao, a: automacao, ...extra };
    for (const [k, v] of Object.entries(all)) if (v) u.set(k, v);
    return `/admin/epic/emails?${u}`;
  };

  return (
    <>
      <Titulo
        sub={
          modo === "live"
            ? "Envio real ligado. Cada mensagem é reavaliada na hora do envio: descadastro, compra feita e limite de 1 e-mail de marketing por dia."
            : "Modo simulado: as mensagens são processadas e registradas, mas não saem (exceto para os e-mails da lista de teste)."
        }
      >
        E-mails
      </Titulo>
      <FiltroPeriodo atual={periodo} base="/admin/epic/emails" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao rotulo="Na fila" valor={tot("fila")} sub={vencidas ? `${vencidas} já vencidas` : "nenhuma vencida"} />
        <Cartao rotulo="Enviados" valor={tot("enviados")} sub={tot("simulados") ? `${tot("simulados")} simulados` : undefined} />
        <Cartao rotulo="Pulados ou cancelados" valor={tot("pulados") + tot("cancelados")} sub="regras de supressão" />
        <Cartao rotulo="Abertura · clique" valor={pct(tot("abertos"), tot("enviados") - tot("simulados"))} sub={`cliques ${pct(tot("cliques"), tot("enviados") - tot("simulados"))} · devolvidos ou spam ${tot("devolvidos")}`} />
      </div>

      <form action={dispararAgora} className="mb-8 flex flex-wrap items-center gap-3 text-sm">
        <button className="rounded bg-grafite px-4 py-2 text-papel">Processar fila agora</button>
        <span className="text-mineral-escuro">O agendador já roda a cada 10 minutos. Use para testar.</span>
      </form>

      <Secao titulo="Por automação">
        <Tabela cab={["Automação", "Fila", "Enviados", "Pulados", "Cancelados", "Falhas", "Abertos", "Cliques"]} vazio={!porAutomacao.length}>
          {porAutomacao.map((r) => (
            <tr key={r.automation_id}>
              <Td>
                <Link href={filtro({ a: r.automation_id })} className="font-mono text-xs underline-offset-2 hover:underline">{r.automation_id}</Link>
                <span className="block text-xs text-mineral-escuro">{NOME[r.automation_id] ?? ""}</span>
              </Td>
              <Td direita>{r.fila}</Td>
              <Td direita>{r.enviados}</Td>
              <Td direita>{r.pulados}</Td>
              <Td direita>{r.cancelados}</Td>
              <Td direita>{r.falhas}</Td>
              <Td direita>{r.abertos}</Td>
              <Td direita>{r.cliques}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Resultado por sequência (envios reais)">
        <Tabela cab={["Automação", "Enviados", "Entregues", "Abertura", "Clique", "Descadastro", "Spam", "Compraram em 7 dias", "Receita"]} vazio={!kpis.length}>
          {kpis.map((k) => (
            <tr key={k.automation_id}>
              <Td>
                <span className="font-mono text-xs">{k.automation_id}</span>
                <span className="block text-xs text-mineral-escuro">{NOME[k.automation_id] ?? ""}</span>
              </Td>
              <Td direita>{k.enviados}</Td>
              <Td direita>{pct(k.entregues, k.enviados)}</Td>
              <Td direita>{pct(k.abertos, k.enviados)}</Td>
              <Td direita>{pct(k.cliques, k.enviados)}</Td>
              <Td direita>{k.descadastros}</Td>
              <Td direita>{k.spam}</Td>
              <Td direita>{k.compradores}</Td>
              <Td direita>{brl(k.receita)}</Td>
            </tr>
          ))}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          Receita atribuída ao último e-mail enviado até 7 dias antes da compra. Envios simulados ficam de fora.
          Abertura e clique dependem do webhook do Resend.
        </p>
      </Secao>

      {motivos.length > 0 && (
        <Secao titulo="Por que não saíram">
          <p className="text-sm text-mineral-escuro">{motivos.map((m) => `${m.skip_reason}: ${m.n}`).join(" · ")}</p>
        </Secao>
      )}

      <Secao titulo="Mensagens">
        <div className="mb-3 flex flex-wrap gap-3 text-sm">
          <Link href={filtro({ s: null })} className={!situacao ? "font-semibold" : "text-mineral-escuro"}>Todas</Link>
          {SITUACOES.map((x) => (
            <Link key={x} href={filtro({ s: x })} className={situacao === x ? "font-semibold" : "text-mineral-escuro"}>{ROTULO[x]}</Link>
          ))}
          {automacao && <Link href={filtro({ a: null })} className="text-latao-escuro">limpar {automacao} ×</Link>}
        </div>
        <Tabela cab={["Para", "Automação", "Prioridade", "Situação", "Programado", "Enviado", "Assunto", ""]} vazio={!fila.length}>
          {fila.map((m) => (
            <tr key={m.message_id as string}>
              <Td>
                <Link href={`/admin/epic/leads/${m.lead_id}`} className="underline-offset-2 hover:underline">{m.email ?? "(sem e-mail)"}</Link>
              </Td>
              <Td><span className="font-mono text-xs">{m.automation_id}</span><span className="block text-xs text-mineral-escuro">{m.step}</span></Td>
              <Td direita>{m.priority}</Td>
              <Td>
                <Selo tom={TOM[m.status as string]}>{ROTULO[m.status as string]}</Selo>
                {m.delivery_mode === "simulated" && <span className="ml-1 text-xs text-latao-escuro">simulado</span>}
                {(m.skip_reason || m.error) && <span className="block text-xs text-mineral-escuro">{m.skip_reason ?? m.error}</span>}
                {Number(m.postponed_count) > 0 && <span className="block text-xs text-mineral-escuro">adiado {m.postponed_count}x</span>}
              </Td>
              <Td>{dataHora(m.scheduled_for as string)}</Td>
              <Td>{dataHora(m.sent_at as string)}</Td>
              <Td>{m.subject ?? "—"}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/epic/emails/${m.message_id}`} className="underline">ver</Link>
                  {m.status === "scheduled" && (
                    <form action={cancelarMensagem}>
                      <input type="hidden" name="id" value={m.message_id as string} />
                      <button className="text-[#8a3f30] underline">cancelar</button>
                    </form>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Tabela>
      </Secao>
    </>
  );
}
