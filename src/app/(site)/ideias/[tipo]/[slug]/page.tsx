import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TextoRico from "@/components/epic/TextoRico";
import { Container, PrimaryCTA } from "@/components/epic/ui";
import { DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { buscarConteudo, TIPO_LABEL, TIPO_ROTA } from "@/lib/epic/server/conteudo";
import { mapaVisivel } from "@/lib/epic/site";

export const revalidate = 60;

type Props = { params: Promise<{ tipo: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo, slug } = await params;
  const c = await buscarConteudo(slug);
  if (!c || TIPO_ROTA[c.content_type] !== tipo) return {};
  // CMS por item (Blueprint v1.2 §57, "SEO para conteúdo editorial"): og_image
  // própria, senão a capa; twitter herda o og.
  const titulo = c.seo_title || c.title;
  const descricao = c.seo_description || c.excerpt || undefined;
  const imagem = c.og_image || c.cover;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/ideias/${tipo}/${slug}` },
    openGraph: { title: titulo, description: descricao, images: imagem ? [imagem] : undefined, type: "article", url: `/ideias/${tipo}/${slug}` },
    twitter: { card: "summary_large_image", title: titulo, description: descricao, images: imagem ? [imagem] : undefined },
  };
}

/** YouTube/Vimeo viram embed; qualquer outro link vira só link. */
function embed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export default async function ConteudoPage({ params }: Props) {
  const { tipo, slug } = await params;
  const c = await buscarConteudo(slug);
  if (!c || TIPO_ROTA[c.content_type] !== tipo) notFound();
  const dim = c.dimension && isDimensionId(c.dimension) ? c.dimension : null;
  const video = c.video_url ? embed(c.video_url) : null;
  const data = c.published_at ? new Date(c.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : null;

  // VideoObject só com título, descrição, miniatura, data e embed reais (§57.14).
  const ehVideo = c.content_type === "video" && Boolean(video && c.cover && c.excerpt && c.published_at);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ehVideo ? "VideoObject" : "Article",
    mainEntityOfPage: `https://epic247.com.br/ideias/${tipo}/${slug}`,
    ...(ehVideo ? { thumbnailUrl: c.cover, embedUrl: video } : {}),
    headline: c.title,
    name: c.title,
    description: c.excerpt ?? undefined,
    datePublished: c.published_at ?? undefined,
    uploadDate: ehVideo ? c.published_at ?? undefined : undefined,
    author: { "@type": "Person", name: c.author || "Ju Ferreira" },
    image: c.cover ?? undefined,
  };

  return (
    <article>
      {/* "<" escapado: um título com "</script>" não consegue fechar a tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="grao border-b border-linha">
        <Container estreito className="pb-12 pt-14 sm:pt-20">
          <p className="font-mono text-sm text-latao-escuro">
            <Link href={`/ideias/${tipo}`} className="hover:underline">{TIPO_LABEL[c.content_type]}</Link>
            {dim ? ` · ${DIMENSIONS[dim].name}` : ""}
            {data ? ` · ${data}` : ""}
          </p>
          <h1 className="entrada mt-4 font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3.2rem]">{c.title}</h1>
          {c.excerpt && <p className="mt-5 text-xl leading-relaxed text-grafite/75">{c.excerpt}</p>}
          {c.author && <p className="mt-6 text-sm text-mineral-escuro">Por {c.author}</p>}
        </Container>
      </header>

      <Container estreito className="py-12">
        {video ? (
          <div className="mb-10 aspect-video overflow-hidden rounded-[var(--radius-epic)] bg-tinta">
            <iframe src={video} title={c.title} className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        ) : c.cover ? (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-epic)]">
            <Image src={c.cover} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
          </div>
        ) : null}
        {c.body && <TextoRico texto={c.body} />}
      </Container>

      {dim && mapaVisivel(dim) && (
        <section className="bg-tinta text-papel">
          <Container estreito className="flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md font-display text-2xl leading-snug">Isso acontece com você? Descubra onde está a sua fricção em {DIMENSIONS[dim].name.toLowerCase()}.</p>
            <PrimaryCTA href={mapPath(dim)} escuro>Fazer o Mapa</PrimaryCTA>
          </Container>
        </section>
      )}
    </article>
  );
}
