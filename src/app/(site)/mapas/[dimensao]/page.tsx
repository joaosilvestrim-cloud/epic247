import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MapRunner from "@/components/epic/MapRunner";
import { Container, DraftRibbon } from "@/components/epic/ui";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { ANSWER_SCALE } from "@/lib/epic/maps/engine";
import { mapaVisivel } from "@/lib/epic/site";

type Params = { params: Promise<{ dimensao: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  const cfg = getDimensionalMap(dimensao);
  return {
    title: cfg.title,
    description: `Autoavaliação educativa em ${cfg.estimatedMinutes}: descubra em qual área de ${DIMENSIONS[dimensao].name.toLowerCase()} está sua maior fricção hoje.`,
    alternates: { canonical: `/mapas/${dimensao}` },
  };
}

export default async function MapaDimensaoPage({ params }: Params) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao) || !mapaVisivel(dimensao)) notFound();
  const cfg = getDimensionalMap(dimensao);
  const opcoes = ANSWER_SCALE.map((s) => ({ valor: s.value, rotulo: s.label }));

  return (
    <>
      {DIMENSIONS[dimensao].map === "draft" && <DraftRibbon texto="Rascunho. Este Mapa ainda não está publicado." />}
      <section className="grao min-h-[70vh]">
        <Container className="py-16 sm:py-24">
          <MapRunner
            mapType={dimensao}
            titulo={cfg.title}
            tempo={`${cfg.questions.length} afirmações · ${cfg.estimatedMinutes} · resultado na hora`}
            resumo="Para cada afirmação, diga com que frequência ela acontece com você hoje. Não existe resposta certa: o Mapa mostra onde vale olhar primeiro, não o que você tem."
            aviso={cfg.disclaimer}
            caminhoResultado={`/mapas/${dimensao}/resultado`}
            perguntas={cfg.questions.map((q) => ({ id: q.id, texto: q.text, opcoes }))}
          />
        </Container>
      </section>
    </>
  );
}
