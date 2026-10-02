import type { Metadata } from "next";
import MapRunner from "@/components/epic/MapRunner";
import Retorno from "@/components/epic/Retorno";
import { Container } from "@/components/epic/ui";
import JsonLd from "@/components/epic/JsonLd";
import { HOME } from "@/lib/epic/content/home";
import { MICRO } from "@/lib/epic/content/microcopy";
import { FRICCAO } from "@/lib/epic/maps";
import { metadados, webPageLd } from "@/lib/epic/seo";

// Blueprint v1.2 §57.3: ferramenta de auto-observação, não teste clínico.
const DESCRICAO =
  "Responda algumas perguntas sobre o que está acontecendo na sua vida agora e descubra qual dimensão parece pedir mais atenção. Gratuito. Resultado imediato. Sem diagnóstico clínico.";

export const metadata: Metadata = metadados({
  titulo: "Mapa de Fricção",
  descricao: DESCRICAO,
  caminho: "/mapa",
  ogTitulo: HOME.mapa.titulo,
});

export default function MapaFriccaoPage() {
  return (
    <>
    <JsonLd dados={webPageLd({ nome: "Mapa de Fricção", descricao: DESCRICAO, caminho: "/mapa" })} />
    <Retorno esconderMapa="/mapa" />
    <section className="grao min-h-[70vh]">
      <Container className="py-16 sm:py-24">
        <MapRunner
          mapType="friccao"
          titulo={HOME.mapa.titulo}
          tempo={`${FRICCAO.questions.length} perguntas · cerca de ${FRICCAO.estimatedMinutes} · resultado na hora`}
          resumo={`${HOME.mapa.texto.join(" ")} Escolha a alternativa que mais se aproxima de você agora. ${MICRO.mapa.semCerto}`}
          aviso={FRICCAO.disclaimer}
          caminhoResultado="/mapa/resultado"
          perguntas={FRICCAO.questions.map((q) => ({
            id: String(q.id),
            texto: q.text,
            opcoes: q.options.map((o) => ({ valor: o.id, rotulo: o.text })),
          }))}
        />
      </Container>
    </section>
    </>
  );
}
