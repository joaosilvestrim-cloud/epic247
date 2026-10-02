import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";
import { MICRO } from "@/lib/epic/content/microcopy";

/**
 * Link de resultado que não abre (Copy Final §27.9). Sem "expirado": ainda
 * não existe política de expiração de token. Responde 404 real.
 */
export default function ResultadoIndisponivel({ novoMapa }: { novoMapa: string }) {
  const m = MICRO.resultadoIndisponivel;
  return (
    <section className="grao min-h-[60vh]">
      <Container estreito className="py-24">
        <h1 className="font-display text-[2.4rem] leading-tight text-grafite">{m.titulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{m.texto}</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCTA href={novoMapa}>{m.novo}</PrimaryCTA>
          <TextCTA href="/">{m.voltar}</TextCTA>
        </div>
      </Container>
    </section>
  );
}
