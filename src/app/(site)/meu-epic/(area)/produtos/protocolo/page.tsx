import type { Metadata } from "next";
import { Cabecalho, Item, Lista, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { DIMENSIONS } from "@/lib/epic/dimensions";
import { DIMENSAO_NO_PROTOCOLO } from "@/lib/epic/content/protocolo";
import { progressoProtocolo, rotuloDimensao, temProtocolo } from "@/lib/epic/meu-epic";
import { acessosDoLead, progressoDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Protocolo EPIC247" };

/**
 * Protocolo (CR-01A §4): as 10 dimensões na ordem recomendada, sem bloqueio
 * sequencial, com estado em texto e progresso agregado simples.
 */
export default async function ProtocoloDaContaPage() {
  const conta = await exigirConta("/meu-epic/produtos/protocolo");
  const r = await withTx(async (q) => {
    const acessos = await acessosDoLead(q, conta.leadId);
    if (!temProtocolo(acessos)) return { tem: false, progresso: [], acessos };
    await registrarEvento(q, "ViewProduct", { lead_id: conta.leadId, product_id: "protocol", product_type: "protocol" });
    return { tem: true, progresso: await progressoDoLead(q, conta.leadId), acessos };
  });
  const voltar = { href: "/meu-epic/produtos", label: "Meus Produtos" };
  if (!r.tem) {
    const teve = r.acessos.some((a) => a.product_type === "protocol");
    return (
      <>
        <Cabecalho titulo="Protocolo EPIC247" voltar={voltar} />
        <Container className="mt-10">
          <Vazio
            texto={teve ? "O acesso ao Protocolo foi encerrado. O histórico continua guardado na sua conta." : "O Protocolo não faz parte da sua conta."}
            acao={teve ? <TextCTA href="/contato?assunto=produtos">Falar com a equipe</TextCTA> : <TextCTA href="/protocolo">Conhecer o Protocolo</TextCTA>}
          />
        </Container>
      </>
    );
  }
  const p = progressoProtocolo(r.progresso);
  const comecou = p.concluidas > 0 || p.dimensoes.some((d) => d.estado === "em_andamento");
  return (
    <>
      <Cabecalho
        titulo="Protocolo EPIC247"
        voltar={voltar}
        apoio="As 10 dimensões na sequência recomendada. Você pode abrir qualquer uma, na ordem que a sua vida pedir."
      />
      <Container>
        <Secao titulo="Seu progresso">
          <p className="font-display text-[1.5rem] leading-snug text-grafite">
            {p.concluidas} de {p.total} dimensões concluídas.
          </p>
          <div
            className="mt-4 h-1 w-full max-w-md bg-linha"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={p.total}
            aria-valuenow={p.concluidas}
            aria-label="Dimensões concluídas"
          >
            <div className="h-1 bg-latao" style={{ width: `${(p.concluidas / p.total) * 100}%` }} />
          </div>
          {p.proxima && (
            <div className="mt-6">
              <PrimaryCTA href={`/meu-epic/produtos/protocolo/${p.proxima}`}>
                {comecou ? `Continuar em ${DIMENSIONS[p.proxima].name}` : `Começar por ${DIMENSIONS[p.proxima].name}`}
              </PrimaryCTA>
            </div>
          )}
        </Secao>
        <Secao titulo="As 10 dimensões">
          <Lista>
            {p.dimensoes.map((d, i) => (
              <Item
                key={d.dimensao}
                href={`/meu-epic/produtos/protocolo/${d.dimensao}`}
                titulo={
                  <>
                    <span className="mr-3 font-mono text-sm text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                    {DIMENSIONS[d.dimensao].name}
                  </>
                }
                meta={DIMENSAO_NO_PROTOCOLO[d.dimensao].funcao}
                status={rotuloDimensao(d.estado)}
                acao="Abrir"
              />
            ))}
          </Lista>
        </Secao>
      </Container>
    </>
  );
}
