import MaterialUpload from "@/components/epic/admin/MaterialUpload";
import { Aviso, dataHora, Secao, Selo, Tabela, Td, Titulo } from "@/components/epic/admin/ui";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { exigirAdmin } from "@/lib/epic/server/admin";
import { query } from "@/lib/epic/server/db";
import { alterarEntrega, excluirMaterial, importarCompradores, publicarMaterial } from "../acessos-actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ok?: string; importados?: string; lidos?: string }> };

const dim = (d: string | null) => (d && isDimensionId(d) ? DIMENSIONS[d].name : d ?? "—");
const TIPO: Record<string, string> = { manual: "Manual", workbook: "Workbook", ferramenta: "Ferramenta", outro: "Outro" };

/**
 * Materiais do Meu EPIC (CR-01): o que cada Kit e o Protocolo entregam.
 * Kit só fica à venda com material publicado da dimensão; Protocolo, com as 10.
 */
export default async function MateriaisPage({ searchParams }: Props) {
  await exigirAdmin();
  const sp = await searchParams;
  const [produtos, materiais, acessos] = await Promise.all([
    query<{ product_id: string; product_type: string; product_dimension: string | null; product_name: string; active: boolean; checkout_url: string | null; delivery: string }>(
      `select product_id, product_type, product_dimension, product_name, active, checkout_url, delivery
       from products where product_type in ('kit','protocol') order by product_type desc, product_id`
    ),
    query<{ asset_id: string; product_type: string; dimension: string; asset_kind: string; title: string; file_name: string; version: number; published: boolean; created_at: string }>(
      `select asset_id, product_type, dimension, asset_kind, title, file_name, version, published, created_at
       from product_assets order by dimension, product_type, asset_kind, version desc`
    ),
    query<{ product_id: string; ativos: number }>(
      `select product_id, count(*) filter (where access_status = 'active')::int ativos from access_grants group by 1`
    ),
  ]);
  const publicados = (tipo: string, d: string | null) =>
    materiais.filter((m) => m.published && (tipo === "protocol" ? true : m.product_type === "kit" && m.dimension === d));
  const dimsComMaterial = new Set(materiais.filter((m) => m.published).map((m) => m.dimension));

  return (
    <>
      <Titulo sub="O que cada Kit e o Protocolo entregam no Meu EPIC. Os arquivos ficam em armazenamento privado: só quem tem acesso baixa, por link que expira em 60 segundos.">
        Materiais
      </Titulo>
      {sp.ok && <Aviso>Salvo.</Aviso>}
      {sp.importados !== undefined && (
        <Aviso>{sp.importados} acesso(s) concedido(s) de {sp.lidos} e-mail(s) lido(s). Quem já tinha acesso foi mantido.</Aviso>
      )}

      <Secao titulo="Entrega e venda">
        <Tabela cab={["Produto", "Entrega", "Materiais publicados", "Situação de venda", "Acessos ativos", ""]}>
          {produtos.map((p) => {
            const n = p.product_type === "protocol" ? dimsComMaterial.size : publicados(p.product_type, p.product_dimension).length;
            const pronto = p.product_type === "protocol" ? n >= 10 : n > 0;
            const vende = p.active && p.checkout_url && (p.delivery === "kiwify" || pronto);
            return (
              <tr key={p.product_id}>
                <Td>{p.product_name}</Td>
                <Td>{p.delivery === "kiwify" ? <Selo tom="alerta">área da Kiwify</Selo> : "Meu EPIC"}</Td>
                <Td>{p.product_type === "protocol" ? `${n} de 10 dimensões` : n}</Td>
                <Td>
                  {vende ? <Selo tom="bom">à venda</Selo> : !p.active || !p.checkout_url ? <Selo>sem checkout ativo</Selo> : <Selo tom="alerta">aguarda materiais</Selo>}
                </Td>
                <Td>{acessos.find((a) => a.product_id === p.product_id)?.ativos ?? 0}</Td>
                <Td>
                  <form action={alterarEntrega}>
                    <input type="hidden" name="product_id" value={p.product_id} />
                    <input type="hidden" name="delivery" value={p.delivery === "kiwify" ? "epic" : "kiwify"} />
                    <button className="underline">
                      {p.delivery === "kiwify" ? "Passar a entregar no Meu EPIC" : "Entregar pela Kiwify"}
                    </button>
                  </form>
                </Td>
              </tr>
            );
          })}
        </Tabela>
        <p className="mt-2 text-xs text-mineral-escuro">
          “Área da Kiwify” é só para a transição do Kit Energia do Ciclo 1. Com os materiais publicados, passe a entregar no Meu EPIC.
        </p>
      </Secao>

      <Secao titulo="Enviar material">
        <MaterialUpload />
        <p className="mt-2 text-xs text-mineral-escuro">
          Mesmo tipo e mesmo título de um material existente vira nova versão: a anterior sai do ar e fica no histórico.
        </p>
      </Secao>

      <Secao titulo="Materiais cadastrados">
        <Tabela cab={["Dimensão", "Produto", "Tipo", "Título", "Arquivo", "Versão", "Situação", "Enviado", ""]} vazio={!materiais.length}>
          {materiais.map((m) => (
            <tr key={m.asset_id}>
              <Td>{dim(m.dimension)}</Td>
              <Td>{m.product_type === "kit" ? "Kit" : "Protocolo"}</Td>
              <Td>{TIPO[m.asset_kind] ?? m.asset_kind}</Td>
              <Td>{m.title}</Td>
              <Td mono>{m.file_name}</Td>
              <Td>{m.version}</Td>
              <Td>{m.published ? <Selo tom="bom">publicado</Selo> : <Selo>oculto</Selo>}</Td>
              <Td>{dataHora(m.created_at)}</Td>
              <Td>
                <div className="flex gap-3">
                  <form action={publicarMaterial}>
                    <input type="hidden" name="asset_id" value={m.asset_id} />
                    <input type="hidden" name="published" value={m.published ? "0" : "1"} />
                    <button className="underline">{m.published ? "Ocultar" : "Publicar"}</button>
                  </form>
                  <form action={excluirMaterial}>
                    <input type="hidden" name="asset_id" value={m.asset_id} />
                    <button className="text-[#8a3f30] underline">Excluir</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </Tabela>
      </Secao>

      <Secao titulo="Migrar compradores anteriores">
        <form id="migracao" action={importarCompradores} className="grid gap-3 rounded border border-linha bg-papel-claro p-4 text-sm">
          <p className="text-mineral-escuro">
            Para quem comprou pela área da Kiwify antes do Meu EPIC (D11). Cole os e-mails da exportação de vendas da Kiwify, um por
            linha. Cada pessoa ganha o acesso ao produto escolhido.
          </p>
          <label className="space-y-1">
            <span className="block text-mineral-escuro">Produto</span>
            <select name="product_id" className="w-full rounded border border-linha bg-papel px-3 py-2">
              {produtos.map((p) => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
            </select>
          </label>
          <textarea name="emails" rows={6} className="w-full rounded border border-linha bg-papel px-3 py-2 font-mono text-xs" placeholder="pessoa@exemplo.com" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="avisar" /> Enviar e-mail com o link de acesso ao Meu EPIC
          </label>
          <div>
            <button className="rounded bg-grafite px-4 py-2 text-papel">Conceder acessos</button>
          </div>
        </form>
      </Secao>
    </>
  );
}
