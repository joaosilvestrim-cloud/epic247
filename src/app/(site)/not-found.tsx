import { Container, PrimaryCTA, TextCTA } from "@/components/epic/ui";

export default function NaoEncontrado() {
  return (
    <section className="grao min-h-[60vh]">
      <Container estreito className="py-24">
        <p className="font-mono text-sm text-latao-escuro">404</p>
        <h1 className="mt-4 font-display text-[2.6rem] leading-tight text-grafite">Esta página não existe, ou ainda não.</h1>
        <p className="mt-4 text-lg text-grafite/80">Talvez o link esteja errado, ou o conteúdo ainda não tenha sido publicado.</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <PrimaryCTA href="/mapa">Descubra seu ponto de fricção</PrimaryCTA>
          <TextCTA href="/">Voltar para o início</TextCTA>
        </div>
      </Container>
    </section>
  );
}
