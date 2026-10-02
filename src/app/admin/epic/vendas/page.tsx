import Link from "next/link";
import { Aviso, brl, Cartao, origem, dataHora, FiltroPeriodo, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { AvisoCarga, brlOu, ImportarCsv, ListaCargas } from "@/components/epic/admin/dados";
import { reprocessarWebhook } from "../actions";
import { salvarRecebivel } from "../kpi-actions";
import { DEFINICAO_CAIXA } from "@/lib/epic/kpi/metricas";
import { STATUS_RECEBIVEL } from "@/lib/epic/kpi/importacao";
import { caixaKpi, recebiveisLista, ultimasCargas } from "@/lib/epic/server/kpi";
import { DIAS_PERIODO, exigirAdmin, periodoDe } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";

type Props = { searchParams: Promise<{ p?: string; w?: string; carga?: string; rec?: string; rec_erro?: string }> };

const TOM: Record<string, "bom" | "alerta" | "ruim" | "neutro"> = {
  approved: "bom", pending: "alerta", refused: "neutro", refunded: "ruim", chargeback: "ruim", cancelled: "neutro",
  scheduled: "alerta", received: "bom", overdue: "ruim",
  processed: "bom", ignored: "neutro", failed: "ruim",
};
const ROTULO: Record<string, string> = {
  approved: "aprovada", pending: "aguardando pagamento", refused: "recusada", refunded: "reembolsada", chargeback: "chargeback",
  cancelled: "cancelada",
  processed: "processado", ignored: "ignorado", failed: "falhou",
};

/** Transações (Kiwify) e o registro bruto dos webhooks, com reprocessamento (RF-077). */
export default async function VendasPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const desde = new Date(Date.now() - DIAS_PERIODO[periodo] * 864e5).toISOString();
  const soProblemas = sp.w === "problemas";

  const [vendas, porProduto, webhooks, caixa, recebiveis, cargas] = await Promise.all([
    query<Record<string, string | null>>(
      `select t.provider, t.transaction_id, t.lead_id, t.buyer_email, t.product_id, p.product_name, t.transaction_status,
              t.payment_method, t.installments, t.amount_gross, t.amount_fee, t.amount_net, t.approved_at, t.received_at,
              t.refunded_at, t.utm_source, t.created_at, l.email
       from transactions t left join products p using (product_id) left join leads l using (lead_id)
       where t.created_at >= $1 order by t.created_at desc limit 200`,
      [desde]
    ),
    query<{ product_name: string; n: string; bruto: string; reemb: string }>(
      `select coalesce(p.product_name, t.product_id, '?') product_name,
              count(*) filter (where t.transaction_status = 'approved') n,
              coalesce(sum(t.amount_gross) filter (where t.transaction_status = 'approved'), 0) bruto,
              count(*) filter (where t.transaction_status in ('refunded','chargeback')) reemb
       from transactions t left join products p using (product_id)
       where t.created_at >= $1 group by 1 order by 3 desc`,
      [desde]
    ),
    query<Record<string, string | number | null>>(
      `select id, provider, event_key, event_type, received_at, processing_status, processing_error, retry_count,
              payload->>'order_status' as order_status, payload->'Product'->>'product_name' as produto
       from webhook_events
       where received_at >= $1 and ($2::boolean is false or processing_status in ('failed','pending'))
       order by received_at desc limit 100`,
      [desde, soProblemas]
    ),
    caixaKpi(periodo),
    recebiveisLista(),
    ultimasCargas("receivables", 5),
  ]);

  const falhas = webhooks.filter((w) => w.processing_status === "failed").length;

  return (
    <>
      <Titulo sub="Vendas registradas a partir dos webhooks da Kiwify. Venda e caixa são números diferentes: o caixa vem dos recebíveis.">
        Vendas
      </Titulo>
      <AvisoCarga carga={sp.carga} />
      {sp.rec && <Aviso>Recebível salvo.</Aviso>}
      {sp.rec_erro && <Aviso tom="ruim">Recebível não salvo: {sp.rec_erro}.</Aviso>}
      <FiltroPeriodo atual={periodo} base="/admin/epic/vendas" />

      <Secao titulo="Caixa">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Cartao rotulo="Vendido no período" valor={brl(caixa.vendido)} sub={`${caixa.vendas} vendas · reembolsos ${brl(caixa.reembolsado)}`} />
          <Cartao rotulo="Receita líquida" valor={brl(caixa.receitaLiquida)} sub={`taxas ${brl(caixa.taxas)}`} />
          <Cartao rotulo="Recebido até hoje" valor={brl(caixa.recebido)}
            sub={`${brl(caixa.recebidoConfirmado)} confirmado · ${brl(caixa.recebidoPresumido)} pela data da Kiwify`} />
          <Cartao rotulo="A receber" valor={brl(caixa.aReceber)}
            sub={`${brl(caixa.aReceberAteCorte)} até 30/12${caixa.vencido ? ` · ${brl(caixa.vencido)} vencido` : ""}${caixa.semData ? ` · ${brl(caixa.semData)} sem data` : ""}`} />
          <Cartao rotulo="Caixa projetado até 30/12" valor={brl(caixa.projetadoAteCorte)} sub="recebido + a receber com data até 30/12" />
          <Cartao rotulo="Vendas sem recebível" valor={caixa.semRecebivel} sub={caixa.semRecebivel ? `${brl(caixa.semRecebivelValor)} líquido fora da projeção` : "todas com previsão"} />
        </div>
        <p className="mt-2 text-xs text-mineral-escuro">
          {DEFINICAO_CAIXA} Vendido e receita líquida são do período. Recebido e a receber são até hoje, de todas as vendas.
          Limite: a Kiwify manda só a data prevista de depósito, sem confirmar o depósito. Venda sem essa data não ganha
          recebível inventado. Para confirmar, importe o extrato ou edite abaixo.
        </p>
      </Secao>

      <Secao titulo="Por produto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {porProduto.length === 0 && <p className="text-sm text-mineral-escuro">Nenhuma venda no período.</p>}
          {porProduto.map((p) => (
            <Cartao key={p.product_name} rotulo={p.product_name} valor={brl(Number(p.bruto))}
              sub={`${p.n} aprovadas${Number(p.reemb) ? ` · ${p.reemb} reembolsos` : ""}`} />
          ))}
        </div>
      </Secao>

      <Secao titulo="Transações">
        <Tabela cab={["Quando", "Produto", "Comprador", "Situação", "Bruto", "Líquido", "Pagamento", "Depósito", "Origem"]} vazio={!vendas.length}>
          {vendas.map((v) => (
            <tr key={`${v.provider}-${v.transaction_id}`}>
              <Td>{dataHora(v.approved_at ?? v.created_at)}</Td>
              <Td>{v.product_name ?? v.product_id ?? "não mapeado"}</Td>
              <Td>
                {v.lead_id ? (
                  <Link className="underline-offset-2 hover:underline" href={`/admin/epic/leads/${v.lead_id}`}>{v.email ?? v.buyer_email ?? v.lead_id.slice(0, 8)}</Link>
                ) : (v.buyer_email ?? "—")}
              </Td>
              <Td><Selo tom={TOM[v.transaction_status ?? ""] ?? "neutro"}>{ROTULO[v.transaction_status ?? ""] ?? v.transaction_status}</Selo></Td>
              <Td direita>{brl(Number(v.amount_gross ?? 0))}</Td>
              <Td direita>{brl(Number(v.amount_net ?? 0))}</Td>
              <Td>{[v.payment_method, v.installments && Number(v.installments) > 1 ? `${v.installments}x` : null].filter(Boolean).join(" ") || "—"}</Td>
              <Td>{v.refunded_at ? `reembolso ${dataHora(v.refunded_at)}` : dataHora(v.received_at)}</Td>
              <Td>{origem(v.utm_source)}</Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <section id="recebiveis" className="mb-10">
        <h2 className="mb-3 font-mono text-sm text-latao-escuro">Recebíveis</h2>
        <Tabela cab={["Venda", "Produto", "Parcela", "Previsto", "Data prevista", "Recebido", "Recebido em", "Situação", "Origem"]} vazio={!recebiveis.length}>
          {recebiveis.map((r) => (
            <tr key={r.receivable_id!}>
              <Td mono>{r.transaction_id}</Td>
              <Td>{r.product_name ?? "—"}</Td>
              <Td direita>{r.installment_number}/{r.installment_total}</Td>
              <Td direita>{brl(Number(r.expected_amount))}</Td>
              <Td>{dia(r.expected_date)}</Td>
              <Td direita>{brlOu(r.net_received_amount != null ? Number(r.net_received_amount) : r.received_amount != null ? Number(r.received_amount) : null)}</Td>
              <Td>{dia(r.received_date)}</Td>
              <Td><Selo tom={TOM[r.receivable_status ?? ""] ?? "neutro"}>{RECEBIVEL[r.receivable_status ?? ""] ?? r.receivable_status}</Selo></Td>
              <Td mono>{r.source_system}</Td>
            </tr>
          ))}
        </Tabela>

        <h3 className="mb-2 mt-6 text-sm text-grafite">Lançar ou corrigir um recebível</h3>
        <form action={salvarRecebivel} className="grid gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Campo rotulo="Venda (order_id)"><input name="transaction_id" required className={CAMPO} /></Campo>
          <Campo rotulo="Parcela"><input name="installment_number" inputMode="numeric" defaultValue="1" className={CAMPO} /></Campo>
          <Campo rotulo="Total de parcelas"><input name="installment_total" inputMode="numeric" defaultValue="1" className={CAMPO} /></Campo>
          <Campo rotulo="Valor líquido previsto (R$)"><input name="expected_amount" required inputMode="decimal" className={CAMPO} /></Campo>
          <Campo rotulo="Data prevista"><input type="date" name="expected_date" className={CAMPO} /></Campo>
          <Campo rotulo="Valor recebido (R$)"><input name="received_amount" inputMode="decimal" className={CAMPO} /></Campo>
          <Campo rotulo="Recebido em"><input type="date" name="received_date" className={CAMPO} /></Campo>
          <Campo rotulo="Taxa (R$)"><input name="fee_amount" inputMode="decimal" className={CAMPO} /></Campo>
          <Campo rotulo="Situação">
            <select name="receivable_status" defaultValue="" className={CAMPO}>
              <option value="">pela data</option>
              {STATUS_RECEBIVEL.map((st) => <option key={st} value={st}>{RECEBIVEL[st]}</option>)}
            </select>
          </Campo>
          <div className="flex items-end">
            <button className="rounded bg-grafite px-4 py-2 text-papel">Salvar</button>
          </div>
        </form>
        <p className="mt-2 text-xs text-mineral-escuro">
          Venda + parcela é a chave: salvar de novo corrige a mesma linha. Sem situação escolhida, vale a data: com data
          de recebimento é recebido, só com data prevista é agendado.
        </p>

        <div id="importar" className="mt-6">
          <ImportarCsv entidade="receivables" origem="kiwify_extrato_csv">
            Extrato de recebíveis, uma linha por parcela. Colunas: transaction_id (ou pedido, order_id), installment_number,
            installment_total, expected_amount, expected_date, received_amount, received_date, receivable_status, fee_amount,
            net_received_amount. Venda que não existe no site é recusada na linha.
          </ImportarCsv>
          <div className="mt-4">
            <ListaCargas cargas={cargas} />
          </div>
        </div>
      </section>

      <Secao titulo="Webhooks recebidos">
        <div className="mb-3 flex gap-3 text-sm">
          <Link href={`/admin/epic/vendas?p=${periodo}`} className={soProblemas ? "text-mineral-escuro" : "font-semibold text-grafite"}>Todos</Link>
          <Link href={`/admin/epic/vendas?p=${periodo}&w=problemas`} className={soProblemas ? "font-semibold text-grafite" : "text-mineral-escuro"}>
            Com problema{falhas ? ` (${falhas})` : ""}
          </Link>
        </div>
        <Tabela cab={["Recebido", "Evento", "Produto", "Situação", "Erro", "Tentativas", ""]} vazio={!webhooks.length}>
          {webhooks.map((w) => (
            <tr key={String(w.id)}>
              <Td>{dataHora(w.received_at as string)}</Td>
              <Td mono>{w.order_status ?? w.event_type ?? "—"}</Td>
              <Td>{w.produto ?? "—"}</Td>
              <Td><Selo tom={TOM[w.processing_status as string] ?? "alerta"}>{ROTULO[w.processing_status as string] ?? w.processing_status}</Selo></Td>
              <Td><span className="text-xs text-mineral-escuro">{w.processing_error ?? ""}</span></Td>
              <Td direita>{w.retry_count}</Td>
              <Td>
                {w.processing_status !== "processed" && (
                  <form action={reprocessarWebhook}>
                    <input type="hidden" name="id" value={String(w.id)} />
                    <button className="rounded border border-grafite px-2 py-1 text-xs">Reprocessar</button>
                  </form>
                )}
              </Td>
            </tr>
          ))}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          Erro “sem mapeamento” é produto da Kiwify sem vínculo com o catálogo. Preencha o ID Kiwify em Produtos e
          reprocesse. “Ignorado” é evento que não muda a venda (ex.: aviso atrasado de uma venda já aprovada). Boleto ou Pix
          gerado fica como “aguardando pagamento” e não libera nada.
        </p>
      </Secao>
    </>
  );
}

const RECEBIVEL: Record<string, string> = {
  pending: "pendente", scheduled: "agendado", received: "recebido", overdue: "atrasado", cancelled: "cancelado",
  refunded: "reembolsado", chargeback: "chargeback",
};
const dia = (d: string | null) => (d ? d.split("-").reverse().join("/") : "—");
const CAMPO = "w-full rounded border border-linha bg-papel px-3 py-2";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-mineral-escuro">{rotulo}</span>
      {children}
    </label>
  );
}
