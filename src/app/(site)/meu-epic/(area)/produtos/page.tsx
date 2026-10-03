import type { Metadata } from "next";
import { Container } from "@/components/epic/ui";
import { Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { progressoProtocolo, rotuloAcesso } from "@/lib/epic/meu-epic";
import { acessosDoLead, progressoDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { dataCurta, mentoriaDaConta } from "@/lib/epic/server/meu-epic";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meus Produtos" };

/** Meus Produtos (CR-01A §4): Kits e Protocolo numa área só. */
export default async function MeusProdutosPage() {
  const conta = await exigirConta("/meu-epic/produtos");
  const { acessos, progresso, mentoria } = await withTx(async (q) => ({
    acessos: await acessosDoLead(q, conta.leadId),
    progresso: await progressoDoLead(q, conta.leadId),
    mentoria: await mentoriaDaConta(q, conta.leadId),
  }));
  const protocolo = acessos.filter((a) => a.product_type === "protocol");
  const kits = acessos.filter((a) => a.product_type === "kit");
  const p = progressoProtocolo(progresso);
  const vazio = !protocolo.length && !kits.length && !mentoria;

  return (
    <>
      <Cabecalho titulo="Meus Produtos" />
      <Container>
        {vazio && (
          <div className="mt-10">
            <Vazio texto="Seus Kits e o Protocolo aparecerão aqui quando estiverem disponíveis para sua conta." />
          </div>
        )}
        {protocolo.length > 0 && (
          <Secao titulo="Protocolo">
            <Lista>
              {protocolo.map((a) => (
                <Item
                  key={a.grant_id}
                  href={a.access_status === "active" ? "/meu-epic/produtos/protocolo" : undefined}
                  titulo={a.product_name}
                  meta={a.access_status === "active" ? `${p.concluidas} de ${p.total} dimensões concluídas` : `Desde ${dataCurta(a.granted_at)}`}
                  status={rotuloAcesso(a.access_status)}
                  acao={a.access_status === "active" ? "Abrir o Protocolo" : undefined}
                />
              ))}
            </Lista>
          </Secao>
        )}
        {kits.length > 0 && (
          <Secao titulo="Kits">
            <Lista>
              {kits.map((a) => (
                <Item
                  key={a.grant_id}
                  href={a.access_status === "active" ? `/meu-epic/produtos/kit/${a.scope}` : undefined}
                  titulo={a.product_name}
                  meta={`Desde ${dataCurta(a.granted_at)}`}
                  status={rotuloAcesso(a.access_status)}
                  acao={a.access_status === "active" ? "Abrir o Kit" : undefined}
                />
              ))}
            </Lista>
          </Secao>
        )}
        {mentoria && (
          <Secao titulo="Mentoria">
            <Lista>
              <Item titulo="Mentoria EPIC Individual" meta="A equipe combina os encontros diretamente com você." status={mentoria} />
            </Lista>
          </Secao>
        )}
      </Container>
    </>
  );
}
