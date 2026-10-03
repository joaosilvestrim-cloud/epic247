import type { Metadata } from "next";
import Link from "next/link";
import { BotaoForm, Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { Container } from "@/components/epic/ui";
import { rotuloAcesso } from "@/lib/epic/meu-epic";
import { acessosDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { comprasDaConta, dataCurta, rotuloCompra } from "@/lib/epic/server/meu-epic";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minha Conta" };

/**
 * Minha Conta (CR-01A §5): estritamente operacional. Sem troca de e-mail,
 * cartão, parcelas ou cancelamento financeiro: isso fica com a Kiwify.
 */
export default async function MinhaContaPage() {
  const conta = await exigirConta("/meu-epic/conta");
  const { compras, acessos } = await withTx(async (q) => ({
    compras: await comprasDaConta(q, conta.leadId),
    acessos: await acessosDoLead(q, conta.leadId),
  }));
  const ativos = acessos.filter((a) => a.access_status === "active").length;

  return (
    <>
      <Cabecalho titulo="Minha Conta" />
      <Container>
        <Secao titulo="Seus dados">
          <dl className="grid gap-4 text-[17px] sm:grid-cols-[12rem_1fr]">
            <dt className="text-mineral-escuro">Nome</dt>
            <dd className="text-grafite">{conta.nome ?? "Não informado"}</dd>
            <dt className="text-mineral-escuro">E-mail principal</dt>
            <dd className="break-all text-grafite">{conta.email}</dd>
            <dt className="text-mineral-escuro">Acesso</dt>
            <dd className="text-grafite">
              {ativos ? `${ativos} ${ativos === 1 ? "produto ativo" : "produtos ativos"}` : "Nenhum produto ativo"}
            </dd>
          </dl>
          <p className="mt-5 text-sm text-mineral-escuro">
            Para trocar o e-mail, fale com a equipe: a troca passa por verificação.
          </p>
        </Secao>

        <Secao titulo="Acessos">
          {acessos.length ? (
            <Lista>
              {acessos.map((a) => (
                <Item key={a.grant_id} titulo={a.product_name} meta={`Desde ${dataCurta(a.granted_at)}`} status={rotuloAcesso(a.access_status)} />
              ))}
            </Lista>
          ) : (
            <Vazio texto="Nenhum produto liberado para esta conta ainda." />
          )}
        </Secao>

        <Secao titulo="Compras">
          {compras.length ? (
            <Lista>
              {compras.map((c, i) => (
                <Item key={i} titulo={c.product_name} meta={dataCurta(c.data)} status={rotuloCompra(c.transaction_status)} />
              ))}
            </Lista>
          ) : (
            <Vazio texto="Nenhuma compra registrada nesta conta." />
          )}
          <p className="mt-5 text-sm text-mineral-escuro">
            Pagamento, parcelas e nota ficam na Kiwify, no e-mail da compra.
          </p>
        </Secao>

        <Secao titulo="Ajuda e privacidade">
          <ul className="space-y-3 text-[17px]">
            <li>
              <Link href="/contato?assunto=produtos" className="link-traco text-grafite">Suporte</Link>
            </li>
            <li>
              <Link href="/privacidade" className="link-traco text-grafite">Política de Privacidade</Link>
            </li>
            <li>
              <Link href="/termos" className="link-traco text-grafite">Termos de Uso</Link>
            </li>
          </ul>
          <form action="/api/v2/conta/sair" method="post" className="mt-10">
            <BotaoForm>Sair</BotaoForm>
          </form>
        </Secao>
      </Container>
    </>
  );
}
