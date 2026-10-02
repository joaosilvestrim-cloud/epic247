import type { Metadata } from "next";
import Link from "next/link";
import FormContato from "@/components/epic/FormContato";
import JsonLd from "@/components/epic/JsonLd";
import { Container, SectionTitle } from "@/components/epic/ui";
import { CONTATO_PAGINA as C } from "@/lib/epic/content/contato";
import { metadados, webPageLd } from "@/lib/epic/seo";
import EscolhaAssunto from "./EscolhaAssunto";

// SEO da Copy Final §24; ContactPage (Blueprint v1.2 §57.15).
export const metadata: Metadata = metadados({
  titulo: C.seo.titulo,
  tituloAbsoluto: true,
  descricao: C.seo.descricao,
  caminho: "/contato",
});

type Props = { searchParams: Promise<{ assunto?: string }> };

export default async function ContatoPage({ searchParams }: Props) {
  const { assunto } = await searchParams;
  return (
    <>
      <JsonLd dados={webPageLd({ nome: "Contato", descricao: C.seo.descricao, caminho: "/contato", tipo: "ContactPage" })} />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="pb-16 pt-14 sm:pt-20">
          <p className="entrada-suave font-mono text-sm text-latao-escuro">{C.hero.eyebrow}</p>
          <h1 className="entrada mt-4 max-w-4xl font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3.3rem]">
            {C.hero.titulo}
          </h1>
          <p className="entrada mt-6 max-w-2xl text-lg leading-relaxed text-grafite/75" style={{ "--atraso": "160ms" } as React.CSSProperties}>
            {C.hero.sub}
          </p>
        </Container>
      </section>

      {/* 2 · Escolha o assunto */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="01">{C.escolha.titulo}</SectionTitle>
          <EscolhaAssunto />
        </Container>
      </section>

      {/* 3 · Formulário */}
      <section id="formulario" className="scroll-mt-24 border-y border-linha bg-papel-escuro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionTitle numero="02">{C.form.titulo}</SectionTitle>
          <FormContato assuntoInicial={assunto} />
        </Container>
      </section>

      {/* 5 · Se o que você procura já está no site */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="03" className="max-w-2xl">
            {C.atalhos.titulo}
          </SectionTitle>
          <p className="revelar mt-5 text-lg text-grafite/75">{C.atalhos.texto}</p>
          <ul className="revelar-lista mt-10 divide-y divide-linha border-y border-linha">
            {C.atalhos.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <span className="font-display text-[1.15rem] text-grafite group-hover:underline group-hover:decoration-latao group-hover:underline-offset-4">
                    {l.texto}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-xs text-latao-escuro">
                    <span aria-hidden>→</span> {l.destino}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 7 · Fechamento */}
      <section className="grao border-t border-linha bg-papel-claro">
        <Container estreito className="py-20 text-center">
          <p className="revelar font-display text-[1.9rem] leading-snug text-grafite sm:text-[2.4rem]">{C.fechamento.titulo}</p>
          <p className="revelar mx-auto mt-4 max-w-xl text-lg text-grafite/75">{C.fechamento.sub}</p>
          <p className="mt-8">
            <a href="#formulario" className="border-b border-latao pb-0.5 text-[15px] font-medium text-grafite">
              {C.fechamento.cta}
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
