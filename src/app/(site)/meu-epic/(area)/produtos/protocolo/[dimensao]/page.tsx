import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Materiais from "@/components/epic/meu-epic/Materiais";
import { BotaoForm, Cabecalho, Secao, Vazio } from "@/components/epic/meu-epic/ui";
import { Container, TextCTA } from "@/components/epic/ui";
import { DIMENSAO_NO_PROTOCOLO } from "@/lib/epic/content/protocolo";
import { DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { ORDEM_PROTOCOLO, progressoProtocolo, rotuloDimensao, temProtocolo } from "@/lib/epic/meu-epic";
import { acessosDoLead, marcarInicio, materiaisDaDimensao, progressoDoLead } from "@/lib/epic/server/acessos";
import { exigirConta } from "@/lib/epic/server/conta";
import { withTx } from "@/lib/epic/server/db";
import { registrarEvento } from "@/lib/epic/server/events";
import { mapasDaConta } from "@/lib/epic/server/meu-epic";
import { mapaVisivel } from "@/lib/epic/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Protocolo EPIC247" };

type Props = { params: Promise<{ dimensao: string }> };

/** Módulo de uma dimensão no Protocolo: função, materiais, Mapa e conclusão. */
export default async function DimensaoDoProtocoloPage({ params }: Props) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) notFound();
  const conta = await exigirConta(`/meu-epic/produtos/protocolo/${dimensao}`);
  const r = await withTx(async (q) => {
    if (!temProtocolo(await acessosDoLead(q, conta.leadId))) return null;
    // Abrir o módulo é ação real: a dimensão passa a "em andamento" (D9).
    await marcarInicio(q, conta.leadId, dimensao);
    await registrarEvento(q, "ViewProtocolDimension", { lead_id: conta.leadId, product_type: "protocol", dimension: dimensao });
    return {
      materiais: await materiaisDaDimensao(q, dimensao, ["protocol", "kit"]),
      progresso: progressoProtocolo(await progressoDoLead(q, conta.leadId)),
      mapa: (await mapasDaConta(q, conta.leadId)).find((m) => m.map_type === dimensao) ?? null,
    };
  });
  if (!r) redirect("/meu-epic/produtos/protocolo");
  const nome = DIMENSIONS[dimensao].name;
  const estado = r.progresso.dimensoes.find((d) => d.dimensao === dimensao)!.estado;
  const i = ORDEM_PROTOCOLO.indexOf(dimensao);
  const seguinte = ORDEM_PROTOCOLO[i + 1] ?? null;
  const info = DIMENSAO_NO_PROTOCOLO[dimensao];

  return (
    <>
      <Cabecalho
        titulo={nome}
        voltar={{ href: "/meu-epic/produtos/protocolo", label: "Protocolo EPIC247" }}
        apoio={
          <span className="font-mono text-sm text-latao-escuro">
            Dimensão {String(i + 1).padStart(2, "0")} de 10 · {rotuloDimensao(estado)}
          </span>
        }
      />
      <Container>
        <Secao titulo="A pergunta desta dimensão">
          <p className="border-l border-latao pl-5 font-display text-[1.35rem] leading-snug text-grafite">{info.pergunta}</p>
          <p className="mt-4 text-[17px] text-grafite/85">{info.funcao}</p>
        </Secao>

        <Secao titulo="Materiais">
          {r.materiais.length ? (
            <Materiais itens={r.materiais} />
          ) : (
            <Vazio texto="Os materiais desta dimensão estão sendo publicados. Avisaremos por e-mail assim que estiverem aqui." />
          )}
        </Secao>

        {mapaVisivel(dimensao) && (
          <Secao titulo="Mapa da dimensão">
            {r.mapa ? (
              <p className="text-[17px] text-grafite/85">
                Seu último Mapa de {nome}: {r.mapa.principal ?? "resultado salvo"}.{" "}
                <TextCTA href={r.mapa.url}>Ver resultado</TextCTA>
              </p>
            ) : (
              <p className="text-[17px] text-grafite/85">Você ainda não fez o Mapa desta dimensão.</p>
            )}
            <p className="mt-4">
              <TextCTA href={mapPath(dimensao)}>{r.mapa ? `Refazer o Mapa de ${nome}` : `Fazer o Mapa de ${nome}`}</TextCTA>
            </p>
          </Secao>
        )}

        <Secao titulo="Conclusão">
          <form action="/api/v2/conta/protocolo" method="post" className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <input type="hidden" name="dimensao" value={dimensao} />
            {estado === "concluido" ? (
              <>
                <p className="text-[17px] text-grafite">Você marcou esta dimensão como concluída.</p>
                <input type="hidden" name="concluida" value="0" />
                <BotaoForm secundario>Desfazer</BotaoForm>
              </>
            ) : (
              <>
                <input type="hidden" name="concluida" value="1" />
                <BotaoForm>Concluí esta dimensão</BotaoForm>
              </>
            )}
          </form>
          {seguinte && (
            <p className="mt-8">
              <TextCTA href={`/meu-epic/produtos/protocolo/${seguinte}`}>Próxima na sequência: {DIMENSIONS[seguinte].name}</TextCTA>
            </p>
          )}
        </Secao>
      </Container>
    </>
  );
}
