import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import IdeiasLista from "@/components/epic/IdeiasLista";
import NewsletterInline from "@/components/epic/NewsletterInline";
import { Container } from "@/components/epic/ui";
import { listarConteudos, TIPO_ROTA, type ItemConteudo } from "@/lib/epic/server/conteudo";

export const revalidate = 60;

const POR_ROTA: Record<string, { tipo: ItemConteudo["content_type"]; titulo: string }> = {
  artigos: { tipo: "artigo", titulo: "Artigos" },
  newsletter: { tipo: "newsletter", titulo: "Newsletter" },
  videos: { tipo: "video", titulo: "Vídeos" },
  repertorio: { tipo: "repertorio", titulo: "Repertório" },
};

type Props = { params: Promise<{ tipo: string }> };

export function generateStaticParams() {
  return Object.values(TIPO_ROTA).map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params;
  const t = POR_ROTA[tipo];
  return t ? { title: `${t.titulo} · Ideias`, alternates: { canonical: `/ideias/${tipo}` } } : {};
}

export default async function IdeiasTipoPage({ params }: Props) {
  const { tipo } = await params;
  const t = POR_ROTA[tipo];
  if (!t) notFound();
  const itens = await listarConteudos({ tipo: t.tipo, limite: 50 });
  return (
    <>
      <section className="grao border-b border-linha">
        <Container className="pb-14 pt-14 sm:pt-20">
          <p className="font-mono text-sm text-latao-escuro">
            <Link href="/ideias" className="hover:underline">Ideias</Link>
          </p>
          <h1 className="entrada mt-4 font-display text-[2.8rem] font-normal leading-[1.05] text-grafite sm:text-[4rem]">{t.titulo}</h1>
        </Container>
      </section>
      <section>
        <Container className="py-16">
          <IdeiasLista itens={itens} />
        </Container>
      </section>
      {t.tipo === "newsletter" && (
        <section className="bg-papel-escuro">
          <Container estreito className="py-16">
            <NewsletterInline />
          </Container>
        </section>
      )}
    </>
  );
}
