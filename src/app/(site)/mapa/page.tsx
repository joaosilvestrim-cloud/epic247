import type { Metadata } from "next";
import MapRunner from "@/components/epic/MapRunner";
import { Container } from "@/components/epic/ui";
import { FRICCAO } from "@/lib/epic/maps";

export const metadata: Metadata = {
  title: "Mapa de Fricção",
  description: "Sete perguntas para descobrir em qual das 10 dimensões a sua vida está pedindo mais atenção hoje.",
  alternates: { canonical: "/mapa" },
};

export default function MapaFriccaoPage() {
  return (
    <section className="grao min-h-[70vh]">
      <Container className="py-16 sm:py-24">
        <MapRunner
          mapType="friccao"
          titulo="Descubra seu ponto de fricção."
          tempo={`${FRICCAO.questions.length} perguntas · cerca de ${FRICCAO.estimatedMinutes} · resultado na hora`}
          resumo="Sete perguntas para descobrir em qual das 10 dimensões a sua vida está pedindo mais atenção hoje. Escolha a alternativa que mais se aproxima de você agora. O resultado aparece na hora, sem pedir e-mail."
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
  );
}
