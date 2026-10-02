import type { Metadata } from "next";
import Link from "next/link";
import IdeiasLista from "@/components/epic/IdeiasLista";
import NewsletterInline from "@/components/epic/NewsletterInline";
import { Container } from "@/components/epic/ui";
import { listarConteudos, TIPO_LABEL, TIPO_ROTA } from "@/lib/epic/server/conteudo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ideias",
  description: "Ideias para viver melhor: artigos, newsletter, vídeos e repertório.",
  alternates: { canonical: "/ideias" },
};

export default async function IdeiasPage() {
  const itens = await listarConteudos({ limite: 30 });
  return (
    <>
      <section className="grao border-b border-linha">
        <Container className="pb-14 pt-14 sm:pt-20">
          <h1 className="entrada font-display text-[2.8rem] font-normal leading-[1.05] text-grafite sm:text-[4.2rem]">
            Ideias para viver melhor.
          </h1>
          <nav aria-label="Tipos de conteúdo" className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {(Object.keys(TIPO_ROTA) as (keyof typeof TIPO_ROTA)[]).map((t) => (
              <Link key={t} href={`/ideias/${TIPO_ROTA[t]}`} className="border-b border-transparent pb-0.5 text-grafite/80 hover:border-latao hover:text-grafite">
                {TIPO_LABEL[t] === "Vídeo" ? "Vídeos" : TIPO_LABEL[t] === "Artigo" ? "Artigos" : TIPO_LABEL[t]}
              </Link>
            ))}
          </nav>
        </Container>
      </section>
      <section>
        <Container className="py-16">
          <IdeiasLista itens={itens} />
        </Container>
      </section>
      <section className="bg-papel-escuro">
        <Container estreito className="py-16">
          <NewsletterInline />
        </Container>
      </section>
    </>
  );
}
