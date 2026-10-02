import Link from "next/link";
import { dataHora, Secao, Selo, Titulo } from "@/components/epic/admin/ui";
import { statusContato } from "../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { capacidadeMentoria } from "@/lib/epic/server/produtos";

type Props = { searchParams: Promise<{ ver?: string }> };

const CONTATO: Record<string, string> = { new: "nova", answered: "respondida", archived: "arquivada" };

/** Mensagens do formulário de contato. A Mentoria tem página própria. */
export default async function CaixaPage({ searchParams }: Props) {
  await exigirAdmin();
  const tudo = (await searchParams).ver === "tudo";
  const [mentoria, contatos, vagas] = await Promise.all([
    query<{ novos: string; espera: string }>(
      `select count(*) filter (where status = 'novo')::text as novos,
              count(*) filter (where status = 'lista_espera')::text as espera
       from mentoring_applications`
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

      <Secao titulo={`Mentoria · ${vagas.ocupadas} de ${vagas.capacidade} clientes ativos`}>
        <p className="text-sm text-grafite">
          {Number(mentoria[0]?.novos ?? 0)} interesse(s) novo(s) e {Number(mentoria[0]?.espera ?? 0)} na lista de espera.{" "}
          <Link href="/admin/epic/mentoria" className="underline">Abrir a Mentoria</Link>
        </p>
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
