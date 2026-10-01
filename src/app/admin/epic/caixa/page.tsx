import Link from "next/link";
import { dataHora, Secao, Selo, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { statusContato, statusMentoria } from "../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { capacidadeMentoria } from "@/lib/epic/server/produtos";

type Props = { searchParams: Promise<{ ver?: string }> };

const MENTORIA: Record<string, string> = {
  new: "nova", in_conversation: "em conversa", client: "virou cliente", waitlist: "lista de espera", disqualified: "não é o momento",
};
const CONTATO: Record<string, string> = { new: "nova", answered: "respondida", archived: "arquivada" };

/** Candidaturas à Mentoria e mensagens do formulário de contato. */
export default async function CaixaPage({ searchParams }: Props) {
  await exigirAdmin();
  const tudo = (await searchParams).ver === "tudo";
  const [candidaturas, contatos, vagas] = await Promise.all([
    query<Record<string, string | null>>(
      `select id, lead_id, name, email, challenge, desired_change, availability, origin_dimension, status, created_at
       from mentoring_applications where ($1 or status in ('new','in_conversation','waitlist'))
       order by created_at desc limit 100`,
      [tudo]
    ),
    query<Record<string, string | null>>(
      `select id, lead_id, name, email, subject, message, status, created_at
       from contact_messages where ($1 or status = 'new') order by created_at desc limit 100`,
      [tudo]
    ),
    capacidadeMentoria(),
  ]);

  return (
    <>
      <Titulo sub={tudo ? "Mostrando tudo, inclusive o que já foi resolvido." : "Mostrando só o que pede ação."}>Caixa de entrada</Titulo>
      <p className="-mt-6 mb-8 text-sm">
        <Link href={tudo ? "/admin/epic/caixa" : "/admin/epic/caixa?ver=tudo"} className="underline">
          {tudo ? "Só pendentes" : "Ver tudo"}
        </Link>
      </p>

      <Secao titulo={`Mentoria · ${vagas.ocupadas} de ${vagas.capacidade} vagas ocupadas`}>
        {!candidaturas.length && <p className="text-sm text-mineral-escuro">Nenhuma candidatura pendente.</p>}
        <div className="space-y-3">
          {candidaturas.map((c) => (
            <article key={c.id} className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-grafite">{c.name}</p>
                  <p className="text-mineral-escuro">
                    <a className="underline" href={`mailto:${c.email}`}>{c.email}</a>
                    {c.lead_id && <> · <Link className="underline" href={`/admin/epic/leads/${c.lead_id}`}>histórico</Link></>}
                    {c.origin_dimension && isDimensionId(c.origin_dimension) && <> · veio de {DIMENSIONS[c.origin_dimension].name}</>}
                  </p>
                </div>
                <span className="text-xs text-mineral-escuro">{dataHora(c.created_at)}</span>
              </header>
              <dl className="mt-3 space-y-2">
                <Resposta p="Principal desafio hoje" r={c.challenge} />
                <Resposta p="Mudança que quer fazer agora" r={c.desired_change} />
                <Resposta p="Disponibilidade" r={c.availability} />
              </dl>
              <form action={statusMentoria} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id!} />
                <Selo tom={c.status === "new" ? "alerta" : "neutro"}>{MENTORIA[c.status!]}</Selo>
                <select name="status" defaultValue={c.status!} className="rounded border border-linha bg-papel px-2 py-1">
                  {Object.entries(MENTORIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className="rounded border border-grafite px-3 py-1">Atualizar</button>
              </form>
            </article>
          ))}
        </div>
      </Secao>

      <Secao titulo="Contato">
        {!contatos.length && <p className="text-sm text-mineral-escuro">Nenhuma mensagem pendente.</p>}
        <div className="space-y-3">
          {contatos.map((c) => (
            <article key={c.id} className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-grafite">{c.subject || "Sem assunto"}</p>
                  <p className="text-mineral-escuro">
                    {c.name} · <a className="underline" href={`mailto:${c.email}?subject=${encodeURIComponent(`Re: ${c.subject ?? "EPIC247"}`)}`}>{c.email}</a>
                    {c.lead_id && <> · <Link className="underline" href={`/admin/epic/leads/${c.lead_id}`}>histórico</Link></>}
                  </p>
                </div>
                <span className="text-xs text-mineral-escuro">{dataHora(c.created_at)}</span>
              </header>
              <p className="mt-3 whitespace-pre-line text-grafite">{c.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Selo tom={c.status === "new" ? "alerta" : "neutro"}>{CONTATO[c.status!]}</Selo>
                {Object.entries(CONTATO).filter(([k]) => k !== c.status).map(([k, v]) => (
                  <form key={k} action={statusContato}>
                    <input type="hidden" name="id" value={c.id!} />
                    <input type="hidden" name="status" value={k} />
                    <button className="rounded border border-linha px-3 py-1 text-mineral-escuro hover:border-grafite hover:text-grafite">marcar {v}</button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Secao>
    </>
  );
}

function Resposta({ p, r }: { p: string; r: string | null }) {
  if (!r) return null;
  return (
    <div>
      <dt className="text-xs text-mineral-escuro">{p}</dt>
      <dd className="whitespace-pre-line text-grafite">{r}</dd>
    </div>
  );
}
