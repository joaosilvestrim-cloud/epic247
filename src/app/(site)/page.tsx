import Image from "next/image";
import Link from "next/link";
import { C, Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import IdeiasLista from "@/components/epic/IdeiasLista";
import Retorno from "@/components/epic/Retorno";
import Visualizacao from "@/components/epic/Visualizacao";
import { temCopy } from "@/lib/epic/content/copy";
import { DIMENSAO_CONTEUDO } from "@/lib/epic/content/dimensoes";
import { HOME } from "@/lib/epic/content/home";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { dimensionPath, dimensoesVisiveis } from "@/lib/epic/site";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

// Tensão-mãe (Posicionamento §2): as formas que a distância assume. Aprovado.
const TENSOES = [
  "tenho tudo para estar bem, mas não estou",
  "sei o que quero, mas não começo",
  "começo e não sustento",
  "minha vida funciona, mas não me entusiasma",
  "estou cansado o tempo inteiro",
  "tenho medo de tomar uma decisão",
  "quero mudar, mas não sei por onde",
];

export default async function Home() {
  const [ideias, settings] = await Promise.all([listarConteudos({ limite: 4 }), getSettings()]);
  const dims = dimensoesVisiveis();
  const cenas = HOME.reconhecimento.cenas.filter(temCopy);
  const passos = HOME.primeiroPasso.cards.filter((c) => temCopy(c.titulo));

  return (
    <>
      <Visualizacao nome="ViewHome" />
      <Retorno />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.5fr_1fr] lg:gap-20 lg:pb-28">
          <div>
            <h1 className="font-display text-[2.4rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem] lg:text-[4.1rem]">
              Tem uma distância entre a vida que você vive e a vida que{" "}
              <span className="marca-mao">sabe que poderia viver</span>?
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-grafite/80">{HOME.hero.subtexto}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <PrimaryCTA href="/mapa">{HOME.hero.ctaPrimario}</PrimaryCTA>
              <TextCTA href="/protocolo">{HOME.hero.ctaSecundario}</TextCTA>
            </div>
          </div>

          <aside aria-label="Formas que essa distância assume" className="self-end">
            <p className="mb-5 font-display text-lg italic text-mineral-escuro">Essa distância pode soar assim:</p>
            <ul className="space-y-3 border-l border-latao pl-5">
              {TENSOES.map((t) => (
                <li key={t} className="font-display text-[1.15rem] leading-snug text-grafite/85">
                  “{t}”
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </section>

      {/* 2 · Reconhecimento */}
      <section className="bg-papel-escuro">
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="01" className="max-w-3xl">
            {HOME.reconhecimento.titulo}
          </SectionTitle>
          {cenas.length > 0 && (
            <div className="mt-14 grid gap-x-14 gap-y-10 md:grid-cols-2">
              {cenas.map((c, i) => (
                <p key={i} className="font-display text-[1.35rem] leading-[1.45] text-grafite/90">
                  <C v={c} />
                </p>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 3 · As 10 dimensões */}
      {dims.length > 0 && (
        <section>
          <Container className="py-20 sm:py-28">
            <SectionTitle numero="02" className="max-w-2xl">
              {HOME.dimensoes.titulo}
            </SectionTitle>
            <ol className="mt-14 grid border-t border-linha sm:grid-cols-2 lg:grid-cols-5">
              {dims.map((d) => {
                const pergunta = DIMENSAO_CONTEUDO[d.id].pergunta;
                return (
                  <li key={d.id} className="border-b border-linha sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(5n)]:border-r-0">
                    <Link href={dimensionPath(d.id)} className="group flex h-full flex-col p-6 transition-colors hover:bg-papel-claro">
                      <span className="font-mono text-xs text-latao-escuro">{String(d.order).padStart(2, "0")}</span>
                      <span className="mt-3 font-display text-[1.45rem] leading-tight text-grafite hyphens-auto break-words lg:text-[1.3rem] xl:text-[1.45rem]">{d.name}</span>
                      <span className="mt-3 text-[15px] leading-snug text-mineral-escuro">
                        {temCopy(pergunta) ? <C v={pergunta} /> : d.manifestoLine}
                      </span>
                      <span aria-hidden className="mt-auto pt-6">
                        <span className="block h-px w-6 bg-latao transition-all duration-300 group-hover:w-14" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      )}

      {/* 4 · Mapa de Fricção */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <SectionTitle numero="03" escuro>
              {HOME.mapa.titulo}
            </SectionTitle>
            {temCopy(HOME.mapa.texto) && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-papel/75">
                <C v={HOME.mapa.texto} />
              </p>
            )}
          </div>
          <div className="lg:justify-self-end">
            <dl className="mb-8 grid grid-cols-3 gap-6 border-t border-papel/15 pt-5 font-mono text-xs text-papel/60">
              <div>
                <dt>perguntas</dt>
                <dd className="mt-1 font-display text-3xl text-papel">7</dd>
              </div>
              <div>
                <dt>minutos</dt>
                <dd className="mt-1 font-display text-3xl text-papel">2</dd>
              </div>
              <div>
                <dt>e-mail</dt>
                <dd className="mt-1 font-display text-3xl text-papel">não</dd>
              </div>
            </dl>
            <PrimaryCTA href="/mapa" escuro>
              {HOME.hero.ctaPrimario}
            </PrimaryCTA>
          </div>
        </Container>
      </section>

      {/* 5 · Primeiro passo */}
      {passos.length > 0 && (
        <section>
          <Container className="py-20 sm:py-28">
            <SectionTitle numero="04" className="max-w-2xl">
              {HOME.primeiroPasso.titulo}
            </SectionTitle>
            <ol className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-4">
              {passos.map((c, i) => (
                <li key={c.href} className="bg-papel">
                  <Link href={c.href} className="group flex h-full flex-col p-7 transition-colors hover:bg-papel-claro">
                    <span className="font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-4 font-display text-xl text-grafite">
                      <C v={c.titulo} />
                    </span>
                    <span className="mt-2 text-[15px] leading-relaxed text-mineral-escuro">
                      <C v={c.texto} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* 6 · Protocolo */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle numero="05">{HOME.protocolo.titulo}</SectionTitle>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-grafite/80">{HOME.protocolo.mensagem}</p>
            <div className="mt-10">
              <PrimaryCTA href="/protocolo">{HOME.protocolo.cta}</PrimaryCTA>
            </div>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {dimensoesVisiveis().length > 0 &&
              dims.map((d) => (
                <li key={d.id} className="flex gap-3 border-b border-linha py-3">
                  <span className="pt-1 font-mono text-[11px] text-latao-escuro">{String(d.order).padStart(2, "0")}</span>
                  <span className="font-display text-[1.05rem] text-grafite">{d.manifestoLine}</span>
                </li>
              ))}
          </ol>
        </Container>
      </section>

      {/* 7 · Ideias */}
      <section>
        <Container className="py-20 sm:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionTitle numero="06">{HOME.ideias.titulo}</SectionTitle>
            {ideias.length > 0 && <TextCTA href="/ideias">Ver todas as ideias</TextCTA>}
          </div>
          <IdeiasLista itens={ideias} />
        </Container>
      </section>

      {/* 8 · Ju */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid items-center gap-12 py-20 sm:py-28 md:grid-cols-[18rem_1fr] md:gap-16">
          {settings.juPhotoUrl ? (
            <div className="relative aspect-[4/5] w-full max-w-[18rem] overflow-hidden rounded-[var(--radius-epic)]">
              <Image
                src={settings.juPhotoUrl}
                alt="Ju Ferreira"
                fill
                sizes="18rem"
                className="object-cover grayscale-[15%]"
              />
            </div>
          ) : (
            <div aria-hidden className="hidden md:block" />
          )}
          <div>
            <p className="font-display text-[1.6rem] leading-[1.35] text-papel sm:text-[2rem]">
              {HOME.ju.mensagem}
            </p>
            <p className="mt-6 font-mono text-xs text-latao">Ju Ferreira</p>
            <div className="mt-8">
              <TextCTA href="/ju" escuro>
                {HOME.ju.cta}
              </TextCTA>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
