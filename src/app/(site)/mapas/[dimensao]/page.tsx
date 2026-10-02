import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MapRunner from "@/components/epic/MapRunner";
import { Container, DraftRibbon } from "@/components/epic/ui";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { ANSWER_SCALE } from "@/lib/epic/maps/engine";
import JsonLd from "@/components/epic/JsonLd";
import { paginaDimensao } from "@/lib/epic/content/copy-final";
import { MICRO } from "@/lib/epic/content/microcopy";
import { metadados, webPageLd } from "@/lib/epic/seo";
import { mapaVisivel } from "@/lib/epic/site";

type Params = { params: Promise<{ dimensao: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  // Blueprint v1.2 §57.4: "Mapa de [Dimensão]" e linguagem de auto-observação.
  return metadados({ titulo: getDimensionalMap(dimensao).title, descricao: descricaoMapa(dimensao), caminho: `/mapas/${dimensao}` });
}

function descricaoMapa(dimensao: (typeof DIMENSION_IDS)[number]) {
  const cfg = getDimensionalMap(dimensao);
  return (
    paginaDimensao(dimensao).mapa.intro ??
    `Autoavaliação educativa em ${cfg.estimatedMinutes}: veja em qual área de ${DIMENSIONS[dimensao].name.toLowerCase()} existe mais fricção hoje.`
  );
}

export default async function MapaDimensaoPage({ params }: Params) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao) || !mapaVisivel(dimensao)) notFound();
  const cfg = getDimensionalMap(dimensao);
  const opcoes = ANSWER_SCALE.map((s) => ({ valor: s.value, rotulo: s.label }));
  // Microcopy do Mapa na Copy Final (seção da dimensão), inclusive o rodapé de responsabilidade.
  const micro = paginaDimensao(dimensao).mapa;

  return (
    <>
      <JsonLd dados={webPageLd({ nome: cfg.title, descricao: descricaoMapa(dimensao), caminho: `/mapas/${dimensao}` })} />
      {DIMENSIONS[dimensao].map === "draft" && <DraftRibbon texto="Rascunho. Este Mapa ainda não está publicado." />}
      <section className="grao min-h-[70vh]">
        <Container className="py-16 sm:py-24">
          <MapRunner
            mapType={dimensao}
            titulo={cfg.title}
            tempo={`${cfg.questions.length} afirmações · ${cfg.estimatedMinutes} · resultado na hora`}
            resumo={`${micro.intro ?? MICRO.mapa.entrada} Para cada afirmação, diga com que frequência ela acontece com você hoje. ${MICRO.mapa.semCerto}`}
            aviso={[micro.responsabilidade ?? cfg.disclaimer, micro.alerta].filter(Boolean).join(" ")}
            calculando={micro.calculando ?? undefined}
            areas={cfg.axes.map((a) => a.label)}
            caminhoResultado={`/mapas/${dimensao}/resultado`}
            perguntas={cfg.questions.map((q) => ({ id: q.id, texto: q.text, opcoes }))}
          />
        </Container>
      </section>
    </>
  );
}
