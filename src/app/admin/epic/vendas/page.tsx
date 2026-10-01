import Link from "next/link";
import { brl, Cartao, origem, dataHora, FiltroPeriodo, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { reprocessarWebhook } from "../actions";
import { DIAS_PERIODO, exigirAdmin, periodoDe } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";

type Props = { searchParams: Promise<{ p?: string; w?: string }> };

const TOM: Record<string, "bom" | "alerta" | "ruim" | "neutro"> = {
  approved: "bom", pending: "alerta", refunded: "ruim", chargeback: "ruim", cancelled: "neutro",
  processed: "bom", ignored: "neutro", failed: "ruim",
};
const ROTULO: Record<string, string> = {
  approved: "aprovada", pending: "pendente", refunded: "reembolsada", chargeback: "chargeback", cancelled: "cancelada",
  processed: "processado", ignored: "ignorado", failed: "falhou",
};

/** Transações (Kiwify) e o registro bruto dos webhooks, com reprocessamento (RF-077). */
export default async function VendasPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const periodo = periodoDe(sp.p);
  const desde = new Date(Date.now() - DIAS_PERIODO[periodo] * 864e5).toISOString();
  const soProblemas = sp.w === "problemas";

  const [vendas, porProduto, webhooks] = await Promise.all([
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
  ]);

  const falhas = webhooks.filter((w) => w.processing_status === "failed").length;

  return (
    <>
      <Titulo sub="Vendas registradas a partir dos webhooks da Kiwify. Valor recebido conta o depósito previsto (D+30 no cartão).">
        Vendas
      </Titulo>
      <FiltroPeriodo atual={periodo} base="/admin/epic/vendas" />

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
          reprocesse. “Ignorado” é evento que não muda a venda (ex.: boleto gerado).
        </p>
      </Secao>
    </>
  );
}
