import Link from "next/link";
import { notFound } from "next/navigation";
import { dataHora, Selo, Titulo } from "@/components/epic/admin/ui";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { previsualizar } from "@/lib/epic/server/dispatcher";

type Props = { params: Promise<{ id: string }> };

/** Pré-visualização de uma mensagem da fila, montada com o estado atual do lead. */
export default async function EmailPreviewPage({ params }: Props) {
  await exigirAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [m] = await query<Record<string, string | null>>(
    `select m.lead_id, l.email, m.automation_id, m.step, m.template_key, m.status, m.skip_reason, m.scheduled_for,
            m.sent_at, m.subject, m.delivery_mode
     from messages m left join leads l using (lead_id) where m.message_id = $1`,
    [id]
  );
  if (!m) notFound();
  const pv = await previsualizar(id);

  return (
    <>
      <p className="mb-2 text-sm"><Link href="/admin/epic/emails" className="text-mineral-escuro hover:text-grafite">← E-mails</Link></p>
      <Titulo sub={<span className="font-mono text-xs">{m.automation_id} · {m.step} · {m.template_key}</span>}>
        {"erro" in pv ? m.subject ?? "Mensagem" : pv.assunto}
      </Titulo>
      <dl className="mb-6 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="text-mineral-escuro">Para</dt>
        <dd><Link className="underline" href={`/admin/epic/leads/${m.lead_id}`}>{m.email ?? "(sem e-mail)"}</Link></dd>
        <dt className="text-mineral-escuro">Situação</dt>
        <dd>{m.status}{m.skip_reason ? ` (${m.skip_reason})` : ""}{m.delivery_mode === "simulated" ? " · simulado" : ""}</dd>
        <dt className="text-mineral-escuro">Programado · enviado</dt>
        <dd>{dataHora(m.scheduled_for)} · {dataHora(m.sent_at)}</dd>
        {!("erro" in pv) && (
          <>
            <dt className="text-mineral-escuro">Se disparasse agora</dt>
            <dd>{pv.decisao}</dd>
            <dt className="text-mineral-escuro">Texto</dt>
            <dd>{pv.aprovado ? <Selo tom="bom">aprovado</Selo> : <Selo tom="alerta">rascunho, não sai em produção se for marketing</Selo>}</dd>
          </>
        )}
      </dl>
      {"erro" in pv ? (
        <p className="text-sm text-[#8a3f30]">{pv.erro}</p>
      ) : (
        <iframe
          title="Pré-visualização"
          srcDoc={pv.html}
          sandbox=""
          className="h-[70vh] w-full max-w-[44rem] rounded-[var(--radius-epic)] border border-linha bg-white"
        />
      )}
      <p className="mt-3 max-w-[44rem] text-xs text-mineral-escuro">
        Montado com os dados de hoje. Se a pessoa comprou ou se descadastrou depois, o que aparece aqui já reflete isso.
      </p>
    </>
  );
}
