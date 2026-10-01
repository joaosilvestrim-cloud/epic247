import { Aviso, brl, Secao, Selo, Titulo } from "@/components/epic/admin/ui";
import { salvarCapacidadeMentoria, salvarProduto } from "../actions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { capacidadeMentoria } from "@/lib/epic/server/produtos";
import { PRICES } from "@/lib/epic/products";

interface Linha {
  product_id: string;
  product_type: string;
  product_name: string;
  price_list: string;
  checkout_url: string | null;
  provider_product_id: string | null;
  active: boolean;
  vendas: string;
}

const GRUPOS: [string, string][] = [
  ["plan", "Planos 7 Dias"],
  ["kit", "Kits"],
  ["protocol", "Protocolo"],
  ["mentoring", "Mentoria"],
];

/** Catálogo (RF-073): preço, link de checkout, vínculo com a Kiwify e ativação. */
type Props = { searchParams: Promise<{ erro?: string; ok?: string; id?: string }> };

export default async function ProdutosPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const [produtos, mentoria] = await Promise.all([
    query<Linha>(
      `select p.product_id, p.product_type, p.product_name, p.price_list, p.checkout_url, p.provider_product_id, p.active,
              (select count(*) from transactions t where t.product_id = p.product_id and t.transaction_status = 'approved') vendas
       from products p order by p.product_type, p.product_id`
    ),
    capacidadeMentoria(),
  ]);

  return (
    <>
      <Titulo sub="Produto só aparece à venda no site quando está ativo e tem link de checkout. Sem isso, a página mostra a lista de espera.">
        Produtos
      </Titulo>

      {sp.ok && <Aviso>Produto {sp.ok} salvo.</Aviso>}
      {sp.erro === "checkout" && <Aviso tom="ruim">O link de checkout de {sp.id} precisa começar com https://. Nada foi salvo.</Aviso>}
      <div className="mb-8 max-w-3xl rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm text-mineral-escuro">
        <p>
          <strong className="text-grafite">Como ligar um produto à Kiwify.</strong> Crie o produto na Kiwify, copie o link do
          checkout e o ID do produto (aparece na URL do painel Kiwify). O ID é o que permite reconhecer a venda quando o
          webhook chega. O site acrescenta sozinho no link quem está comprando (sck) e de qual Mapa veio (src).
        </p>
      </div>

      {GRUPOS.map(([tipo, titulo]) => {
        const itens = produtos.filter((p) => p.product_type === tipo);
        if (!itens.length) return null;
        return (
          <Secao key={tipo} titulo={titulo}>
            <div className="space-y-2">
              {itens.map((p) => (
                <form
                  key={p.product_id}
                  id={p.product_id}
                  action={salvarProduto}
                  className="grid items-end gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm lg:grid-cols-[14rem_7rem_1fr_11rem_auto_auto]"
                >
                  <input type="hidden" name="product_id" value={p.product_id} />
                  <div>
                    <p className="font-semibold text-grafite">{p.product_name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-mineral-escuro">
                      <span className="font-mono">{p.product_id}</span>
                      {p.active && p.checkout_url ? <Selo tom="bom">à venda</Selo> : <Selo>fora de venda</Selo>}
                      {Number(p.vendas) > 0 && <span>{p.vendas} vendas</span>}
                    </p>
                  </div>
                  <Campo rotulo="Preço (R$)">
                    <input name="price_list" defaultValue={Number(p.price_list).toString()} inputMode="decimal" className={CAMPO} />
                  </Campo>
                  <Campo rotulo="Link do checkout">
                    <input name="checkout_url" defaultValue={p.checkout_url ?? ""} placeholder="https://pay.kiwify.com.br/..." className={CAMPO} />
                  </Campo>
                  <Campo rotulo="ID do produto na Kiwify">
                    <input name="provider_product_id" defaultValue={p.provider_product_id ?? ""} className={CAMPO} />
                  </Campo>
                  <label className="flex items-center gap-2 pb-2">
                    <input type="checkbox" name="active" defaultChecked={p.active} /> Ativo
                  </label>
                  <button className="rounded bg-grafite px-4 py-2 text-papel">Salvar</button>
                </form>
              ))}
            </div>
            {tipo === "mentoring" && (
              <form action={salvarCapacidadeMentoria} className="mt-3 flex flex-wrap items-end gap-3 rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-4 text-sm">
                <Campo rotulo="Vagas da Mentoria neste ciclo">
                  <input name="capacidade" type="number" min={0} max={50} defaultValue={mentoria.capacidade} className={`${CAMPO} w-24`} />
                </Campo>
                <button className="rounded bg-grafite px-4 py-2 text-papel">Salvar</button>
                <p className="pb-2 text-mineral-escuro">
                  {mentoria.ocupadas} ocupadas. {mentoria.disponivel ? "Aceitando candidaturas." : "Esgotada: a página mostra lista de espera."}
                </p>
              </form>
            )}
          </Secao>
        );
      })}
      <p className="text-xs text-mineral-escuro">Preços de referência (Modelo Financeiro): Plano {brl(PRICES.plan)}, Kit {brl(PRICES.kit)}, Protocolo {brl(PRICES.protocol)}, Mentoria {brl(PRICES.mentoring)}.</p>
    </>
  );
}

const CAMPO = "w-full rounded border border-linha bg-papel px-3 py-2";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-mineral-escuro">{rotulo}</span>
      {children}
    </label>
  );
}
