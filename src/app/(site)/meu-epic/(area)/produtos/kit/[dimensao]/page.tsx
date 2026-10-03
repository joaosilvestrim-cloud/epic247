import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Materiais from "@/components/epic/meu-epic/Materiais";
import { Cabecalho, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { Container, TextCTA } from "@/components/epic/ui";
import { DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { podeAbrirKit, temProtocolo } from "@/lib/epic/meu-epic";
import { acessosDoLead, materiaisDaDimensao } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { mapaVisivel } from "@/lib/epic/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kit" };

type Props = { params: Promise<{ dimensao: string }> };

/** Kit comprado (CR-01A §4): Manual, Workbook e ferramentas da dimensão. */
export default async function KitDaContaPage({ params }: Props) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) notFound();
  const conta = await exigirConta(`/meu-epic/produtos/kit/${dimensao}`);
  const r = await withTx(async (q) => {
    const acessos = await acessosDoLead(q, conta.leadId);
    if (!podeAbrirKit(acessos, dimensao)) return { acessos, materiais: [] };
    const materiais = await materiaisDaDimensao(q, dimensao, ["kit"]);
    await registrarEvento(q, "ViewProduct", {
      lead_id: conta.leadId, product_id: `kit_${dimensao}`, product_type: "kit", dimension: dimensao,
    });
    return { acessos, materiais };
  });
  const nome = DIMENSIONS[dimensao].name;
  const voltar = { href: "/meu-epic/produtos", label: "Meus Produtos" };
  const grant = r.acessos.find((a) => a.product_type === "kit" && a.scope === dimensao);

  if (!podeAbrirKit(r.acessos, dimensao)) {
    return (
      <>
        <Cabecalho titulo={`Kit EPIC ${nome}`} voltar={voltar} />
        <Container className="mt-10">
          <Vazio
            texto={grant ? "O acesso a este Kit foi encerrado. O histórico continua guardado na sua conta." : "Este Kit não faz parte da sua conta."}
            acao={grant ? <TextCTA href="/contato?assunto=produtos">Falar com a equipe</TextCTA> : <TextCTA href={`/kit/${dimensao}`}>Conhecer o Kit {nome}</TextCTA>}
          />
        </Container>
      </>
    );
  }

  const viaProtocolo = !grant || grant.access_status !== "active";
  return (
    <>
      <Cabecalho
        titulo={`Kit EPIC ${nome}`}
        voltar={voltar}
        apoio={viaProtocolo && temProtocolo(r.acessos) ? "Incluído no seu Protocolo EPIC247." : "Uma sugestão de ordem: o Manual primeiro, depois o Workbook, um exercício por dia."}
      />
      <Container>
        <Secao titulo="Materiais">
          {r.materiais.length ? (
            <Materiais itens={r.materiais} />
          ) : grant?.delivery === "kiwify" ? (
            <Vazio texto="Os materiais deste Kit estão na área da Kiwify, no e-mail da compra. Em breve eles também ficarão aqui." />
          ) : (
            <Vazio texto="Os materiais deste Kit estão sendo publicados. Avisaremos por e-mail assim que estiverem aqui." />
          )}
        </Secao>
        {mapaVisivel(dimensao) && (
          <Secao titulo="Mapa da dimensão">
            <p className="text-[17px] text-grafite/85">Refazer o Mapa ajuda a ver o que mudou desde a primeira vez.</p>
            <p className="mt-4">
              <TextCTA href={mapPath(dimensao)}>Fazer o Mapa de {nome}</TextCTA>
            </p>
          </Secao>
        )}
      </Container>
    </>
  );
}
