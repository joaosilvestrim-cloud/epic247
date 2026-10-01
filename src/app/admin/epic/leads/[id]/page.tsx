import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, brl, dataHora, ETAPA_LABEL, origem, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { anonimizarLead } from "../../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; anonimizado?: string }> };

const UUID = /^[0-9a-f-]{36}$/i;
const dim = (v: string | null) => (v && isDimensionId(v) ? DIMENSIONS[v].name : v ?? "—");

/** Ficha do lead: identidade, origem, Mapas, compras, mensagens e eventos (RF-064). */
export default async function LeadPage({ params, searchParams }: Props) {
  const sp = await searchParams;
  await exigirAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [l] = await query<Record<string, string | number | boolean | null | string[]>>(
    "select * from lead_profile where lead_id = $1",
    [id]
  );
  if (!l) {
    const [m] = await query<{ merged_into: string | null }>("select merged_into from leads where lead_id = $1", [id]);
    if (m?.merged_into) {
      return (
        <p>
          Este visitante foi unificado com outro registro.{" "}
          <Link className="underline" href={`/admin/epic/leads/${m.merged_into}`}>Abrir o registro principal</Link>
        </p>
      );
    }
    notFound();
  }

  const [mapas, compras, mensagens, eventos, sessoes] = await Promise.all([
    query<Record<string, string | null>>(
      `select map_type, status, started_at, completed_at, primary_dimension, primary_pattern, secondary_pattern,
              result_kind, result_token, current_step
       from map_results where lead_id in (select lead_id from leads where lead_id = $1 or merged_into = $1)
       order by started_at desc`,
      [id]
    ),
    query<Record<string, string | null>>(
      `select t.transaction_id, t.product_id, p.product_name, t.transaction_status, t.amount_gross, t.approved_at,
              t.received_at, t.refunded_at, t.utm_source
       from transactions t left join products p using (product_id) where t.lead_id = $1 order by t.created_at desc`,
      [id]
    ),
    query<Record<string, string | null>>(
      `select message_id, automation_id, step, template_key, status, skip_reason, scheduled_for, sent_at, subject, delivery_mode
       from messages where lead_id = $1 order by scheduled_for desc limit 60`,
      [id]
    ),
    query<Record<string, string | null>>(
      `select event_name, occurred_at, page_url, map_type, dimension, product_id, utm_source
       from events where lead_id in (select lead_id from leads where lead_id = $1 or merged_into = $1)
       order by occurred_at desc limit 80`,
      [id]
    ),
    query<Record<string, string | null>>(
      `select session_started_at, landing_page, utm_source, utm_medium, utm_campaign, device, os, in_app, city, region
       from sessions where lead_id in (select lead_id from leads where lead_id = $1 or merged_into = $1)
       order by session_started_at desc limit 20`,
      [id]
    ),
  ]);

  const anonimizado = !l.email && Boolean(l.unsubscribed_at) && !l.first_name;

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/admin/epic/leads" className="text-mineral-escuro hover:text-grafite">← Leads</Link></p>
      <Titulo sub={<span className="font-mono text-xs">{id}</span>}>
        {(l.email as string) ?? (anonimizado ? "Pessoa anonimizada" : "Visitante anônimo")}
      </Titulo>

      {sp.anonimizado && <Aviso>Dados pessoais apagados.</Aviso>}
      {sp.erro === "confirmar" && <Aviso tom="ruim">Para anonimizar, digite ANONIMIZAR no campo de confirmação.</Aviso>}
      <div className="mb-10 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Bloco titulo="Pessoa">
          <Linha k="Nome" v={(l.first_name as string) ?? "—"} />
          <Linha k="Etapa" v={ETAPA_LABEL[l.lifecycle_stage as string] ?? (l.lifecycle_stage as string)} />
          <Linha k="Criado" v={dataHora(l.created_at as string)} />
          <Linha k="Última atividade" v={dataHora(l.last_activity_at as string)} />
          {l.inactive_flag ? <Linha k="Inativo desde" v={dataHora(l.inactive_since as string)} /> : null}
        </Bloco>
        <Bloco titulo="Consentimento">
          <Linha k="E-mail transacional" v={l.email_consent ? `sim, ${dataHora(l.email_consent_at as string)}` : "não"} />
          <Linha k="Fonte" v={(l.email_consent_source as string) ?? "—"} />
          <Linha k="Marketing" v={l.unsubscribed_at ? `descadastrado em ${dataHora(l.unsubscribed_at as string)}` : l.marketing_email_allowed ? "aceitou" : "não aceitou"} />
          <Linha k="Política" v={(l.privacy_policy_version as string) ?? "—"} />
        </Bloco>
        <Bloco titulo="Origem">
          <Linha k="Primeiro toque" v={[origem(l.first_touch_source as string | null), l.first_touch_medium, l.first_touch_campaign].filter(Boolean).join(" / ")} />
          <Linha k="Entrou por" v={(l.first_touch_landing_page as string) ?? "—"} />
          <Linha k="Último toque" v={[origem(l.last_touch_source as string | null), l.last_touch_medium, l.last_touch_campaign].filter(Boolean).join(" / ")} />
        </Bloco>
        <Bloco titulo="Valor">
          <Linha k="Comprou (bruto)" v={brl(Number(l.lifetime_revenue_gross))} />
          <Linha k="Recebido" v={brl(Number(l.lifetime_cash_received))} />
          <Linha k="Mapas concluídos" v={String(l.maps_completed_count)} />
          <Linha k="Última dimensão" v={dim(l.latest_primary_dimension as string | null)} />
          {l.mentoring_waitlist ? <Linha k="Mentoria" v="lista de espera" /> : null}
        </Bloco>
      </div>

      <Secao titulo="Mapas">
        <Tabela cab={["Mapa", "Situação", "Resultado", "Tipo", "Início", "Conclusão", ""]} vazio={!mapas.length}>
          {mapas.map((m, i) => (
            <tr key={i}>
              <Td>{m.map_type === "friccao" ? "Fricção" : dim(m.map_type)}</Td>
              <Td>{m.status === "completed" ? "concluído" : `parou na ${m.current_step}`}</Td>
              <Td>{m.map_type === "friccao" ? dim(m.primary_dimension) : [m.primary_pattern, m.secondary_pattern].filter(Boolean).join(" + ") || "—"}</Td>
              <Td>{m.result_kind ?? "—"}</Td>
              <Td>{dataHora(m.started_at)}</Td>
              <Td>{dataHora(m.completed_at)}</Td>
              <Td>
                {m.result_token && (
                  <a className="underline" target="_blank" rel="noreferrer"
                    href={m.map_type === "friccao" ? `/mapa/resultado/${m.result_token}` : `/mapas/${m.map_type}/resultado/${m.result_token}`}>
                    ver
                  </a>
                )}
              </Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Compras">
        <Tabela cab={["Produto", "Situação", "Valor", "Aprovada", "Depósito", "Origem", "Transação"]} vazio={!compras.length}>
          {compras.map((c) => (
            <tr key={c.transaction_id}>
              <Td>{c.product_name ?? c.product_id}</Td>
              <Td>{c.transaction_status}</Td>
              <Td direita>{brl(Number(c.amount_gross ?? 0))}</Td>
              <Td>{dataHora(c.approved_at)}</Td>
              <Td>{dataHora(c.received_at)}</Td>
              <Td>{origem(c.utm_source)}</Td>
              <Td mono>{c.transaction_id}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="E-mails">
        <Tabela cab={["Automação", "Etapa", "Situação", "Programado", "Enviado", "Assunto", ""]} vazio={!mensagens.length}>
          {mensagens.map((m) => (
            <tr key={m.message_id}>
              <Td mono>{m.automation_id}</Td>
              <Td>{m.step}</Td>
              <Td>
                {m.status}
                {m.skip_reason && <span className="block text-xs text-mineral-escuro">{m.skip_reason}</span>}
                {m.delivery_mode === "simulated" && <span className="block text-xs text-latao-escuro">simulado</span>}
              </Td>
              <Td>{dataHora(m.scheduled_for)}</Td>
              <Td>{dataHora(m.sent_at)}</Td>
              <Td>{m.subject ?? "—"}</Td>
              <Td><Link className="underline" href={`/admin/epic/emails/${m.message_id}`}>ver</Link></Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Visitas">
        <Tabela cab={["Quando", "Entrou por", "Origem", "Aparelho", "Local"]} vazio={!sessoes.length}>
          {sessoes.map((s, i) => (
            <tr key={i}>
              <Td>{dataHora(s.session_started_at)}</Td>
              <Td mono>{s.landing_page ?? "—"}</Td>
              <Td>{[origem(s.utm_source), s.utm_medium, s.utm_campaign].filter(Boolean).join(" / ")}</Td>
              <Td>{[s.device, s.os, s.in_app].filter(Boolean).join(" · ") || "—"}</Td>
              <Td>{[s.city, s.region].filter(Boolean).join(", ") || "—"}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Eventos recentes">
        <Tabela cab={["Quando", "Evento", "Contexto", "Página"]} vazio={!eventos.length}>
          {eventos.map((e, i) => (
            <tr key={i}>
              <Td>{dataHora(e.occurred_at)}</Td>
              <Td mono>{e.event_name}</Td>
              <Td>{[e.map_type, e.dimension, e.product_id, e.utm_source].filter(Boolean).join(" · ") || "—"}</Td>
              <Td mono>{e.page_url ? e.page_url.replace(/^https?:\/\/[^/]+/, "") : "—"}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <div id="lgpd" />
      <Secao titulo="LGPD">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
            <p className="font-semibold text-grafite">Exportar dados</p>
            <p className="mt-1 text-mineral-escuro">Arquivo JSON com tudo o que guardamos sobre esta pessoa. Use para responder a um pedido de acesso.</p>
            <a href={`/admin/epic/leads/${id}/exportar`} className="mt-3 inline-block rounded border border-grafite px-4 py-2 text-grafite">Baixar JSON</a>
          </div>
          <form action={anonimizarLead} className="rounded-[var(--radius-epic)] border border-[#b06a5a]/50 bg-papel-claro p-5 text-sm">
            <p className="font-semibold text-grafite">Anonimizar</p>
            <p className="mt-1 text-mineral-escuro">
              Apaga nome, e-mail, respostas, mensagens de contato e candidatura. Mantém as transações (obrigação fiscal) sem o
              e-mail e os números agregados sem ligação com a pessoa. Não tem volta.
            </p>
            <input type="hidden" name="lead_id" value={id} />
            <div className="mt-3 flex flex-wrap gap-2">
              <input name="confirmar" placeholder="Digite ANONIMIZAR" className="w-48 rounded border border-linha bg-papel px-3 py-2" autoComplete="off" />
              <button className="rounded bg-[#8a3f30] px-4 py-2 text-papel" disabled={anonimizado}>Anonimizar</button>
            </div>
            {anonimizado && <p className="mt-2"><Selo tom="neutro">já anonimizado</Selo></p>}
          </form>
        </div>
      </Secao>
    </>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4">
      <p className="mb-2 font-mono text-xs text-latao-escuro">{titulo}</p>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-mineral-escuro">{k}</dt>
      <dd className="text-right text-grafite">{v}</dd>
    </div>
  );
}
