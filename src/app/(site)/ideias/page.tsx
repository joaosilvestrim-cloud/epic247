import type { Metadata } from "next";
import Link from "next/link";
import IdeiasLista from "@/components/epic/IdeiasLista";
import JsonLd from "@/components/epic/JsonLd";
import NewsletterForm from "@/components/epic/NewsletterForm";
import { Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { copyText } from "@/lib/epic/content/copy";
import { IDEIAS_PAGINA as I } from "@/lib/epic/content/ideias";
import { MICRO } from "@/lib/epic/content/microcopy";
import { PERGUNTA_MENU } from "@/lib/epic/content/navegacao";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { metadados, webPageLd } from "@/lib/epic/seo";
import { listarConteudos, listarDestaques, minutosDeLeitura, TIPO_LABEL, TIPO_ROTA } from "@/lib/epic/server/conteudo";

export const revalidate = 60;

// SEO da Copy Final §23.14; CollectionPage (Blueprint v1.2 §57.11).
export const metadata: Metadata = metadados({
  titulo: I.seo.titulo,
  tituloAbsoluto: true,
  descricao: I.seo.descricao,
  caminho: "/ideias",
  ogTitulo: I.seo.ogTitulo,
  ogDescricao: I.seo.ogDescricao,
});

type Props = { searchParams: Promise<{ dimensao?: string }> };

function Sobretitulo({ children, escuro = false }: { children: React.ReactNode; escuro?: boolean }) {
  return <p className={`revelar mb-4 font-display text-lg italic ${escuro ? "text-latao" : "text-latao-escuro"}`}>{children}</p>;
}

export default async function IdeiasPage({ searchParams }: Props) {
  const { dimensao } = await searchParams;
  const filtro = dimensao && isDimensionId(dimensao) ? dimensao : null;
  const [destaques, artigos, videos, repertorio, filtrados] = await Promise.all([
    listarDestaques(1),
    listarConteudos({ tipo: "artigo", limite: 6 }),
    listarConteudos({ tipo: "video", limite: 3 }),
    listarConteudos({ tipo: "repertorio", limite: 3 }),
    filtro ? listarConteudos({ dimensao: filtro, limite: 30 }) : Promise.resolve([]),
  ]);
  const destaque = destaques[0] ?? null;

  return (
    <>
      <JsonLd dados={webPageLd({ nome: "Ideias", descricao: I.seo.descricao, caminho: "/ideias", tipo: "CollectionPage" })} />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="pb-16 pt-14 sm:pt-20">
          <p className="entrada-suave font-mono text-sm text-latao-escuro">{I.hero.eyebrow}</p>
          <h1 className="entrada mt-4 max-w-4xl font-display text-[2.6rem] font-normal leading-[1.06] text-grafite sm:text-[4rem]">
            {I.hero.titulo}
          </h1>
          <p className="entrada mt-6 max-w-2xl font-display text-[1.35rem] italic leading-snug text-grafite/85" style={{ "--atraso": "160ms" } as React.CSSProperties}>
            {I.hero.sub}
          </p>
          <p className="mt-5 max-w-2xl text-lg text-grafite/75">{I.hero.texto}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PrimaryCTA href="#explore">{I.hero.cta}</PrimaryCTA>
            <TextCTA href="/mapa">{I.hero.cta2}</TextCTA>
          </div>
          <p className="mt-4 text-sm text-mineral-escuro">{I.hero.micro}</p>
          <nav aria-label="Tipos de conteúdo" className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-linha pt-6">
            {(Object.keys(TIPO_ROTA) as (keyof typeof TIPO_ROTA)[]).map((t) => (
              <Link key={t} href={`/ideias/${TIPO_ROTA[t]}`} className="border-b border-transparent pb-0.5 text-grafite/80 hover:border-latao hover:text-grafite">
                {{ artigo: "Artigos", video: "Vídeos", newsletter: "Newsletter", repertorio: "Repertório" }[t]}
              </Link>
            ))}
          </nav>
        </Container>
      </section>

      {/* Filtro por dimensão (vem dos CTAs "Explorar ideias sobre…") */}
      {filtro && (
        <section className="border-b border-linha bg-papel-claro">
          <Container className="py-14">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-[1.9rem] text-grafite">Ideias sobre {DIMENSIONS[filtro].name}</h2>
              <Link href="/ideias" className="text-sm text-mineral-escuro underline underline-offset-2">
                Ver todas
              </Link>
            </div>
            {filtrados.length > 0 ? (
              <IdeiasLista itens={filtrados} />
            ) : (
              <div>
                <p className="font-display text-xl text-grafite">{MICRO.vazio.titulo}</p>
                <p className="mt-2 text-grafite/75">{MICRO.vazio.texto}</p>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* 2 · O papel desta página */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <SectionTitle numero="01">{I.papel.titulo}</SectionTitle>
            <p className="revelar mt-6 text-lg text-grafite/80">{I.papel.abertura}</p>
            <ul className="revelar-lista mt-8 space-y-4 border-l border-latao pl-5 font-display text-[1.2rem] leading-snug text-grafite/90">
              {I.papel.perguntas.map((q) => <li key={q}>{q}</li>)}
            </ul>
            <p className="revelar mt-8 text-lg text-grafite/80">{I.papel.fechamento}</p>
          </div>
          <ol className="revelar-lista self-center space-y-1 font-display text-[1.45rem] leading-snug text-grafite">
            {I.papel.destaque.map((t, i) => (
              <li key={t} style={{ paddingLeft: `${i * 0.9}rem` }}>
                {t}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 3 · Destaque editorial: curadoria, não o último post */}
      {destaque && (
        <section className="grao bg-tinta text-papel">
          <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
            <div>
              <Sobretitulo escuro>{I.destaque.eyebrow}</Sobretitulo>
              <p className="font-display text-[2rem] leading-tight sm:text-[2.6rem]">{destaque.title}</p>
              {destaque.excerpt && <p className="mt-5 max-w-xl text-lg text-papel/75">{destaque.excerpt}</p>}
              <p className="mt-5 font-mono text-xs text-latao">
                {[
                  TIPO_LABEL[destaque.content_type],
                  destaque.dimension && isDimensionId(destaque.dimension) ? DIMENSIONS[destaque.dimension].name : null,
                  minutosDeLeitura(destaque.body) ? `${minutosDeLeitura(destaque.body)} min` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-8">
                <PrimaryCTA href={`/ideias/${TIPO_ROTA[destaque.content_type]}/${destaque.slug}`} escuro>
                  {I.destaque.cta}
                </PrimaryCTA>
              </div>
            </div>
            {destaque.cover && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-epic)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={destaque.cover} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </Container>
        </section>
      )}

      {/* 4 · Explore pela vida, não pelo formato */}
      <section id="explore" className="scroll-mt-24 border-y border-linha bg-papel-escuro">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="02" className="max-w-3xl">
            {I.explore.titulo}
          </SectionTitle>
          <ul className="revelar-lista mt-12 grid gap-x-10 gap-y-2 md:grid-cols-2">
            {DIMENSION_IDS.map((id) => (
              <li key={id} className="border-b border-linha">
                <Link href={`/ideias?dimensao=${id}#conteudo`} scroll className="group block py-5">
                  <span className="font-mono text-xs text-latao-escuro">{DIMENSIONS[id].name}</span>
                  <span className="mt-1.5 block font-display text-[1.12rem] leading-snug text-grafite group-hover:underline group-hover:decoration-latao group-hover:underline-offset-4">
                    {copyText(PERGUNTA_MENU[id])}
                  </span>
                  <span className="mt-2 block text-[13px] font-medium text-grafite/70">{I.explore.cta(DIMENSIONS[id].name)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5 · Artigos */}
      <section>
        <Container className="py-20 sm:py-24">
          <Sobretitulo>{I.artigos.eyebrow}</Sobretitulo>
          <SectionTitle numero="03" className="max-w-2xl">
            {I.artigos.titulo}
          </SectionTitle>
          <p className="revelar mt-5 max-w-2xl text-lg text-grafite/75">{I.artigos.texto}</p>
          <div className="mt-12">
            <IdeiasLista itens={artigos} />
          </div>
          <p className="mt-8">
            <TextCTA href="/ideias/artigos">{I.artigos.cta}</TextCTA>
          </p>
        </Container>
      </section>

      {/* 6 · Ju pensa / vídeos */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Sobretitulo>{I.videos.eyebrow}</Sobretitulo>
            <SectionTitle numero="04">{I.videos.titulo}</SectionTitle>
            <div className="revelar mt-6 space-y-2 text-lg text-grafite/80">
              {I.videos.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <p className="revelar mt-4 font-display text-[1.4rem] italic text-grafite">{I.videos.citacao}</p>
          </div>
          <div>
            <IdeiasLista itens={videos} />
            <p className="mt-8">
              <TextCTA href="/ideias/videos">{I.videos.cta}</TextCTA>
            </p>
          </div>
        </Container>
      </section>

      {/* 7 · Histórias e cultura */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Sobretitulo>{I.historias.eyebrow}</Sobretitulo>
            <SectionTitle numero="05">{I.historias.titulo}</SectionTitle>
          </div>
          <div>
            <div className="revelar space-y-2 text-lg text-grafite/80">
              {I.historias.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <p className="revelar mt-6 font-mono text-sm text-latao-escuro">{I.historias.principio}</p>
            <div className="mt-10">
              <IdeiasLista itens={repertorio} />
            </div>
            <p className="mt-8">
              <TextCTA href="/ideias/repertorio">{I.historias.cta}</TextCTA>
            </p>
          </div>
        </Container>
      </section>

      {/* 8 · Ferramentas */}
      <section className="border-y border-linha bg-papel-escuro">
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Sobretitulo>{I.ferramentas.eyebrow}</Sobretitulo>
            <SectionTitle numero="06">{I.ferramentas.titulo}</SectionTitle>
            <p className="revelar mt-6 max-w-xl text-lg text-grafite/80">{I.ferramentas.texto}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
            <PrimaryCTA href="/dimensoes">{I.ferramentas.cta}</PrimaryCTA>
            <TextCTA href="/mapa">{I.ferramentas.cta2}</TextCTA>
          </div>
        </Container>
      </section>

      {/* 9 · Newsletter */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Sobretitulo>{I.newsletter.eyebrow}</Sobretitulo>
            <SectionTitle numero="07">{I.newsletter.titulo}</SectionTitle>
            <div className="revelar mt-6 space-y-2 text-lg text-grafite/80">
              {I.newsletter.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
          <div className="self-end">
            <NewsletterForm claro aceiteCaixa={I.newsletter.consentimento} micro={I.newsletter.micro} rotuloCampo={I.newsletter.campo} />
          </div>
        </Container>
      </section>

      {/* 10 · Ideias em movimento: depois do conteúdo, nunca antes */}
      <section className="border-t border-linha bg-papel-claro">
        <Container className="py-20 sm:py-24">
          <Sobretitulo>{I.movimento.eyebrow}</Sobretitulo>
          <SectionTitle numero="08" className="max-w-3xl">
            {I.movimento.titulo}
          </SectionTitle>
          <p className="revelar mt-5 max-w-2xl text-lg text-grafite/75">{I.movimento.texto}</p>
          <ul className="revelar-lista mt-12 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-3">
            {I.movimento.caminhos.map((c) => (
              <li key={c.nome} className="bg-papel">
                <Link href={c.href} className="group flex h-full flex-col p-7 transition-colors hover:bg-papel-claro">
                  <span className="font-display text-xl text-grafite">{c.nome}</span>
                  <span className="mt-2 flex-1 text-[15px] leading-relaxed text-mineral-escuro">{c.texto}</span>
                  <span className="mt-5 flex items-center gap-2 text-[14px] font-medium text-grafite/85 group-hover:text-tinta">
                    {c.cta}
                    <span aria-hidden className="block h-px w-5 bg-latao transition-all duration-300 group-hover:w-9" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 11 · Fechamento */}
      <section className="grao">
        <Container estreito className="py-24 text-center">
          <p className="revelar font-display text-[2rem] leading-snug text-grafite sm:text-[2.6rem]">{I.fechamento.titulo}</p>
          <p className="revelar mx-auto mt-5 max-w-xl text-lg text-grafite/75">{I.fechamento.sub}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <PrimaryCTA href="#explore">{I.fechamento.cta}</PrimaryCTA>
            <TextCTA href="/mapa">{I.fechamento.cta2}</TextCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
