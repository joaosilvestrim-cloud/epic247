import type { Metadata } from "next";
import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { MICRO } from "@/lib/epic/content/microcopy";
import { NAO_INDEXAR } from "@/lib/epic/seo";

// 404 real (Blueprint v1.2 §57.19): o Next responde 404 e a página não indexa.
export const metadata: Metadata = { title: "Página não encontrada", robots: NAO_INDEXAR };

export default function NaoEncontrado() {
  const m = MICRO.naoEncontrada;
  return (
    <section className="grao min-h-[60vh]">
      <Container estreito className="py-24">
        <p className="font-mono text-sm text-latao-escuro">404</p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-tight text-grafite">{m.titulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{m.texto}</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCTA href="/">{m.voltar}</PrimaryCTA>
          <TextCTA href="/mapa">{m.friccao}</TextCTA>
        </div>
      </Container>
    </section>
  );
}
