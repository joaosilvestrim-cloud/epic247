import Link from "next/link";
import { Aviso, Cartao, dataHora, Secao, Selo, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import {
  EM_TRATATIVA,
  ehStatusMentoria,
  podeLiberarLink,
  ROTULO_STATUS,
  STATUS_MENTORIA,
  TRANSICOES,
  type StatusMentoria,
} from "@/lib/epic/mentoria";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { capacidadeMentoria, produto, vendavel } from "@/lib/epic/server/produtos";
import { liberarLinkMentoria, mudarStatusMentoria, salvarNotaMentoria } from "./actions";

type Props = { searchParams: Promise<{ status?: string; ok?: string; erro?: string }> };

const ABERTOS: StatusMentoria[] = [...EM_TRATATIVA, "lista_espera"];

const TOM: Record<StatusMentoria, "neutro" | "bom" | "alerta" | "ruim"> = {
  novo: "alerta", em_contato: "neutro", vaga_confirmada: "neutro", link_enviado: "neutro",
  ativo: "bom", concluido: "neutro", lista_espera: "neutro", encerrado_sem_aderencia: "neutro",
};

const MSG_OK: Record<string, string> = {
  status: "Status atualizado.",
  link: "Link de pagamento liberado. O e-mail entrou na fila e foi disparado agora.",
  nota: "Nota salva.",
};
const MSG_ERRO: Record<string, string> = {
  status: "Pedido inválido.",
  transicao: "Essa mudança de status não é permitida a partir do status atual.",
  checkout: "A Mentoria ainda não tem checkout Kiwify ativo. Configure em Produtos antes de liberar o link.",
  capacidade: "Os clientes ativos já ocupam todas as vagas. Conclua um ciclo ou aumente a capacidade em Produtos.",
  sem_email: "Esta candidatura não tem e-mail. Não há como enviar o link.",
};

interface Candidatura {
  id: string;
  lead_id: string | null;
  name: string;
  email: string;
  whatsapp: string | null;
  context: string | null;
  challenge: string | null;
  desired_change: string | null;
  availability: string | null;
  origin_dimension: string | null;
  kind: string;
  status: string;
  marketing_opt_in: boolean;
  internal_note: string | null;
  payment_link_sent_at: string | null;
  status_changed_at: string | null;
  created_at: string;
}

/**
 * Mentoria piloto (RC1 §6): interesse → contato → vaga confirmada → link de
 * pagamento → pagamento confirmado (webhook) → ativo → concluído.
 */
export default async function MentoriaAdminPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const filtro = sp.status === "tudo" || ehStatusMentoria(sp.status) ? sp.status : null;
  const lista: string[] = filtro === "tudo" ? [...STATUS_MENTORIA] : filtro ? [filtro] : [...ABERTOS, "ativo"];

  const [candidaturas, contagem, vagas, p] = await Promise.all([
    query<Candidatura>(
      `select id, lead_id, name, email, whatsapp, context, challenge, desired_change, availability, origin_dimension,
              kind, status, marketing_opt_in, internal_note, payment_link_sent_at, status_changed_at, created_at
       from mentoring_applications where status = any($1)
       order by case status when 'novo' then 0 when 'em_contato' then 1 when 'vaga_confirmada' then 2
                when 'link_enviado' then 3 when 'ativo' then 4 when 'lista_espera' then 5 else 6 end,
                created_at
       limit 200`,
      [lista]
    ),
    query<{ status: string; n: string }>("select status, count(*)::text as n from mentoring_applications group by status"),
    capacidadeMentoria(),
    produto("mentoring"),
  ]);
  const n = (st: StatusMentoria) => Number(contagem.find((c) => c.status === st)?.n ?? 0);
  const checkoutOk = vendavel(p);

  return (
    <>
      <Titulo sub="O envio do formulário não reserva vaga. O link de pagamento só sai depois da vaga confirmada.">
        Mentoria
      </Titulo>

      {sp.ok && MSG_OK[sp.ok] && <div className="mb-6"><Aviso>{MSG_OK[sp.ok]}</Aviso></div>}
      {sp.erro && MSG_ERRO[sp.erro] && <div className="mb-6"><Aviso tom="ruim">{MSG_ERRO[sp.erro]}</Aviso></div>}

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          rotulo="Clientes ativos"
          valor={`${vagas.ocupadas} de ${vagas.capacidade}`}
          sub={vagas.disponivel ? "A página mostra o formulário de interesse." : "A página mostra a lista de espera."}
        />
        <Cartao rotulo="Vaga confirmada ou link enviado" valor={vagas.reservadas} sub="Ainda sem pagamento confirmado." />
        <Cartao rotulo="Aguardando contato" valor={n("novo") + n("em_contato")} />
        <Cartao rotulo="Lista de espera" valor={n("lista_espera")} />
      </div>
      {!checkoutOk && (
        <div className="mb-8">
          <Aviso tom="ruim">
            A Mentoria está sem checkout Kiwify ativo. Dá para conversar e confirmar vagas, mas o link de pagamento
            só pode ser liberado depois de configurar em <Link className="underline" href="/admin/epic/produtos#mentoring">Produtos</Link>.
          </Aviso>
        </div>
      )}
      {vagas.disponivel && vagas.ocupadas + vagas.reservadas >= vagas.capacidade && (
        <div className="mb-8">
          <Aviso tom="ruim">
            Clientes ativos somados às vagas confirmadas já chegam à capacidade. Liberar outro link pode passar do limite.
          </Aviso>
        </div>
      )}

      <nav className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Filtro atual={filtro} valor={null}>Em aberto e ativos</Filtro>
        {STATUS_MENTORIA.map((st) => (
          <Filtro key={st} atual={filtro} valor={st}>{`${ROTULO_STATUS[st]} (${n(st)})`}</Filtro>
        ))}
        <Filtro atual={filtro} valor="tudo">Tudo</Filtro>
      </nav>

      <Secao titulo={filtro && filtro !== "tudo" && ehStatusMentoria(filtro) ? ROTULO_STATUS[filtro] : "Candidaturas"}>
        {!candidaturas.length && <p className="text-sm text-mineral-escuro">Nada por aqui.</p>}
        <div className="space-y-3">
          {candidaturas.map((c) => {
            const st = ehStatusMentoria(c.status) ? c.status : null;
            const proximos = st ? TRANSICOES[st] : [];
            return (
              <article id={`c-${c.id}`} key={c.id} className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-5 text-sm">
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold text-grafite">{c.name}</p>
                    <p className="text-mineral-escuro">
                      <a className="underline" href={`mailto:${c.email}`}>{c.email}</a>
                      {c.whatsapp && (
                        <> · <a className="underline" href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{c.whatsapp}</a></>
                      )}
                      {c.lead_id && <> · <Link className="underline" href={`/admin/epic/leads/${c.lead_id}`}>histórico</Link></>}
                      {c.origin_dimension && isDimensionId(c.origin_dimension) && <> · veio de {DIMENSIONS[c.origin_dimension].name}</>}
                    </p>
                  </div>
                  <div className="text-right text-xs text-mineral-escuro">
                    <p>Entrou em {dataHora(c.created_at)}{c.kind === "lista_espera" ? " pela lista de espera" : ""}</p>
                    {c.status_changed_at && <p>Status desde {dataHora(c.status_changed_at)}</p>}
                    {c.payment_link_sent_at && <p>Link enviado em {dataHora(c.payment_link_sent_at)}</p>}
                  </div>
                </header>

                <dl className="mt-3 space-y-2">
                  <Resposta p="O que gostaria de trabalhar" r={c.context} />
                  <Resposta p="Principal desafio (formulário antigo)" r={c.challenge} />
                  <Resposta p="Mudança desejada (formulário antigo)" r={c.desired_change} />
                  <Resposta p="Disponibilidade (formulário antigo)" r={c.availability} />
                </dl>
                <p className="mt-2 text-xs text-mineral-escuro">
                  {c.marketing_opt_in ? "Aceitou receber conteúdos do EPIC247." : "Não pediu conteúdos do EPIC247."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Selo tom={st ? TOM[st] : "neutro"}>{st ? ROTULO_STATUS[st] : c.status}</Selo>
                  {proximos.length > 0 && (
                    <form action={mudarStatusMentoria} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="filtro" value={filtro ?? ""} />
                      <label className="sr-only" htmlFor={`st-${c.id}`}>Novo status</label>
                      <select id={`st-${c.id}`} name="status" className="rounded border border-linha bg-papel px-2 py-1">
                        {proximos.map((k) => <option key={k} value={k}>{ROTULO_STATUS[k]}</option>)}
                      </select>
                      <button className="rounded border border-grafite px-3 py-1">Mudar status</button>
                    </form>
                  )}
                  {st && podeLiberarLink(st) && (
                    <form action={liberarLinkMentoria}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="filtro" value={filtro ?? ""} />
                      <button
                        disabled={!checkoutOk}
                        className="rounded bg-grafite px-3 py-1 font-semibold text-papel hover:bg-tinta disabled:opacity-40"
                      >
                        {st === "link_enviado" ? "Reenviar link de pagamento" : "Liberar link de pagamento"}
                      </button>
                    </form>
                  )}
                </div>
                {st === "ativo" && (
                  <p className="mt-2 text-xs text-mineral-escuro">
                    Ativo só pelo pagamento confirmado na Kiwify. Marque Concluído no fim do ciclo para liberar a vaga.
                  </p>
                )}
                {st === "encerrado_sem_aderencia" && (
                  <p className="mt-2 text-xs text-mineral-escuro">Status interno. Nunca comunicar como reprovação.</p>
                )}

                <form action={salvarNotaMentoria} className="mt-4">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="filtro" value={filtro ?? ""} />
                  <label htmlFor={`nota-${c.id}`} className="mb-1 block text-xs text-mineral-escuro">Nota interna</label>
                  <div className="flex flex-wrap items-start gap-2">
                    <textarea
                      id={`nota-${c.id}`}
                      name="nota"
                      rows={2}
                      maxLength={2000}
                      defaultValue={c.internal_note ?? ""}
                      className="min-w-0 flex-1 rounded border border-linha bg-papel px-2 py-1"
                    />
                    <button className="rounded border border-linha px-3 py-1 text-mineral-escuro hover:border-grafite hover:text-grafite">
                      Salvar nota
                    </button>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      </Secao>
    </>
  );
}

function Filtro({ atual, valor, children }: { atual: string | null; valor: string | null; children: React.ReactNode }) {
  const ativo = atual === valor;
  return (
    <Link
      href={valor ? `/admin/epic/mentoria?status=${valor}` : "/admin/epic/mentoria"}
      className={ativo ? "font-semibold text-grafite underline" : "text-mineral-escuro hover:text-grafite"}
      aria-current={ativo ? "page" : undefined}
    >
      {children}
    </Link>
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
