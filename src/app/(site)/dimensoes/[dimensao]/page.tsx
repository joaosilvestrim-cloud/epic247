import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import IdeiasLista from "@/components/epic/IdeiasLista";
import MarcaMao from "@/components/epic/MarcaMao";
import PosicaoDimensao from "@/components/epic/PosicaoDimensao";
import Retorno from "@/components/epic/Retorno";
import Visualizacao from "@/components/epic/Visualizacao";
import { C, Container, DraftRibbon, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { copyText, IS_PRODUCTION, temCopy } from "@/lib/epic/content/copy";
import { DIMENSAO_CONTEUDO } from "@/lib/epic/content/dimensoes";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath, type DimensionId } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { formatPrice } from "@/lib/epic/products";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, dimensionPath, mapaVisivel } from "@/lib/epic/site";

export const revalidate = 60;

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

type Params = { params: Promise<{ dimensao: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  const d = DIMENSIONS[dimensao];
  const cont = DIMENSAO_CONTEUDO[dimensao];
  return {
    title: d.name,
    description: copyText(cont.subtitulo) ?? d.manifestoLine,
    alternates: { canonical: dimensionPath(dimensao) },
  };
}

export default async function DimensaoPage({ params }: Params) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao) || !dimensaoVisivel(dimensao)) notFound();

  const d = DIMENSIONS[dimensao];
  const cont = DIMENSAO_CONTEUDO[dimensao];
  const mapa = getDimensionalMap(dimensao);
  const temMapa = mapaVisivel(dimensao);
  const [produtos, conteudos] = await Promise.all([listarProdutos(), listarConteudos({ dimensao, limite: 12 })]);
  // Blueprint §8: articles[] e videos[] no bloco editorial; repertoire[] no Repertório.
  const ideias = conteudos.filter((c) => c.content_type !== "repertorio").slice(0, 4);
  const repertorio = conteudos.filter((c) => c.content_type === "repertorio").slice(0, 3);
  const plano = produtos.find((p) => p.product_id === `plan_${dimensao}`);
  const kit = produtos.find((p) => p.product_id === `kit_${dimensao}`);
  const ofertas = [plano, kit].filter((p) => vendavel(p) || (!IS_PRODUCTION && p));
  const relacionadas = mapa.related.filter((r) => dimensaoVisivel(r.dimension));
  const reconhecimento = Object.values(mapa.profiles).map((p) => p.recognition);
  const ctaMapa = temMapa
    ? { href: mapPath(dimensao), label: `Fazer o ${mapa.title}` }
    : { href: "/mapa", label: "Descubra seu ponto de fricção" };

  return (
    <>
      <Visualizacao nome="ViewDimensionPage" dados={{ dimension: dimensao }} />
      {d.page === "draft" && <DraftRibbon />}
      <Retorno />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
          <div>
          <p className="entrada-suave font-mono text-sm text-latao-escuro">
            Dimensão {String(d.order).padStart(2, "0")} de 10
          </p>
          <h1 className="entrada mt-4 font-display text-[3.2rem] font-normal leading-none text-grafite sm:text-[5.5rem]">
            {d.name}
          </h1>
          {/* Linha do Manifesto da dimensão (Posicionamento §12, aprovado). */}
          <p className="entrada mt-6 font-display text-[1.35rem] italic text-grafite/80 sm:text-[1.6rem]" style={{ "--atraso": "160ms" } as React.CSSProperties}>
            <MarcaMao atraso={800}>{d.manifestoLine}</MarcaMao>
          </p>
          {temCopy(cont.pergunta) && (
            <p className="mt-8 max-w-3xl font-display text-[1.6rem] leading-[1.3] text-grafite/90 sm:text-[2.1rem]">
              <C v={cont.pergunta} />
            </p>
          )}
          {temCopy(cont.subtitulo) && (
            <p className="mt-5 max-w-2xl text-lg text-grafite/75">
              <C v={cont.subtitulo} />
            </p>
          )}
          <div className="mt-10">
            <PrimaryCTA href={ctaMapa.href}>{ctaMapa.label}</PrimaryCTA>
          </div>
          </div>
          <PosicaoDimensao atual={dimensao} />
        </Container>
      </section>

      {/* 2 · Reconhecimento (frases de reconhecimento dos 5 perfis: aprovadas) */}
      <section className="bg-papel-escuro">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="01" className="max-w-2xl">
            Isso acontece com você?
          </SectionTitle>
          <ul className="revelar-lista mt-12 grid gap-x-14 gap-y-8 md:grid-cols-2">
            {reconhecimento.map((r) => (
              <li key={r} className="border-l border-latao pl-5 font-display text-[1.25rem] leading-snug text-grafite/90">
                {r}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3 · Explicação + as 5 áreas */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <SectionTitle numero="02">{d.manifestoLine}</SectionTitle>
            {temCopy(cont.explicacao) && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-grafite/80">
                <C v={cont.explicacao} />
              </p>
            )}
          </div>
          <div>
            <p className="font-display text-lg italic text-mineral-escuro">
              As cinco áreas que o {mapa.title} observa:
            </p>
            <ol className="revelar-lista mt-5 border-t border-linha">
              {mapa.axes.map((a, i) => (
                <li key={a.key} className="flex items-baseline gap-4 border-b border-linha py-3.5">
                  <span className="font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-xl text-grafite">{a.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* 4 · CTA do Mapa */}
      <section className="grao bg-tinta text-papel">
        <Container className="flex flex-col gap-10 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs text-latao">
              {temMapa ? `15 perguntas · ${mapa.estimatedMinutes} · resultado na hora` : "Comece pelo Mapa de Fricção"}
            </p>
            <p className="mt-4 font-display text-[1.7rem] leading-snug sm:text-[2.2rem]">
              Descubra onde, em {d.name.toLowerCase()}, está a sua fricção hoje.
            </p>
          </div>
          <PrimaryCTA href={ctaMapa.href} escuro>
            {ctaMapa.label}
          </PrimaryCTA>
        </Container>
      </section>

      {/* 5 · Conteúdo editorial */}
      {(ideias.length > 0 || !IS_PRODUCTION) && (
        <section>
          <Container className="py-20 sm:py-24">
            <SectionTitle numero="03" className="mb-10">
              Ideias sobre {d.name.toLowerCase()}
            </SectionTitle>
            <IdeiasLista itens={ideias} />
          </Container>
        </section>
      )}

      {/* 6 · Ferramentas e produtos */}
      {ofertas.length > 0 && (
        <section className="border-y border-linha bg-papel-claro">
          <Container className="py-20 sm:py-24">
            <SectionTitle numero="04" className="mb-12">
              Para trabalhar {d.name.toLowerCase()} na prática
            </SectionTitle>
            <div className="grid gap-6 md:grid-cols-2">
              {ofertas.map((p) => (
                <Link
                  key={p!.product_id}
                  href={`/${p!.product_type === "plan" ? "plano" : "kit"}/${dimensao}`}
                  className="group flex flex-col rounded-[var(--radius-epic)] border border-linha bg-papel p-8 transition-colors hover:border-latao"
                >
                  <span className="font-mono text-xs text-latao-escuro">
                    {p!.product_type === "plan" ? "7 dias" : "Manual + Workbook + ferramentas"}
                  </span>
                  <span className="mt-3 font-display text-2xl text-grafite">{p!.product_name}</span>
                  <span className="mt-2 text-[15px] text-mineral-escuro">
                    {p!.product_type === "plan"
                      ? "Um plano de 7 dias personalizado a partir das suas respostas no Mapa."
                      : `O aprofundamento completo da dimensão ${d.name}.`}
                  </span>
                  <span className="mt-8 flex items-baseline justify-between">
                    <span className="font-display text-3xl text-grafite">{formatPrice(p!.price_list)}</span>
                    {!vendavel(p) && <span className="font-mono text-xs text-mineral-escuro">em breve</span>}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 7 · Repertório */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="05">Repertório</SectionTitle>
          <div className="mt-10 max-w-2xl border-l border-latao pl-6">
            <p className="font-mono text-xs text-latao-escuro">No cinema</p>
            <p className="mt-2 font-display text-3xl text-grafite">{cont.filme}</p>
          </div>
          {repertorio.length > 0 && (
            <div className="mt-10">
              <IdeiasLista itens={repertorio} />
            </div>
          )}
        </Container>
      </section>

      {/* 8 · Conexão com outras dimensões */}
      {relacionadas.length > 0 && (
        <section className="bg-papel-escuro">
          <Container className="py-20 sm:py-24">
            <SectionTitle numero="06" className="max-w-2xl">
              Às vezes a fricção está em outro lugar
            </SectionTitle>
            <ul className="revelar-lista mt-12 divide-y divide-linha border-y border-linha">
              {relacionadas.map((r) => (
                <li key={r.dimension}>
                  <Link
                    href={dimensionPath(r.dimension)}
                    className="group grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-8"
                  >
                    <span className="font-display text-xl text-grafite group-hover:underline group-hover:decoration-latao group-hover:underline-offset-4">
                      {DIMENSIONS[r.dimension as DimensionId].name}
                    </span>
                    <span className="text-[15px] text-mineral-escuro">
                      {r.when.charAt(0).toUpperCase() + r.when.slice(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 9 · Protocolo */}
      <section>
        <Container className="grid gap-8 py-20 sm:py-24 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <SectionTitle numero="07">{d.name} é uma das 10 dimensões do EPIC247.</SectionTitle>
            <p className="mt-5 max-w-xl text-lg text-grafite/80">
              Você pode começar por uma dimensão específica. Mas algumas mudanças exigem olhar o sistema inteiro.
            </p>
          </div>
          <TextCTA href="/protocolo">Conhecer o Protocolo</TextCTA>
        </Container>
      </section>

      {/* 10 · CTA final (frase de fechamento do Mapa: aprovada) */}
      <section className="grao bg-tinta text-papel">
        <Container estreito className="py-24 text-center">
          <p className="font-display text-[1.7rem] leading-snug sm:text-[2.3rem]">{mapa.closingPhrase}</p>
          <div className="mt-10 flex justify-center">
            <PrimaryCTA href={ctaMapa.href} escuro>
              {ctaMapa.label}
            </PrimaryCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
