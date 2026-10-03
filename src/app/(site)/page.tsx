import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import IdeiasLista from "@/components/epic/IdeiasLista";
import MarcaMao from "@/components/epic/MarcaMao";
import SinalFriccao from "@/components/epic/SinalFriccao";
import JsonLd from "@/components/epic/JsonLd";
import Retorno from "@/components/epic/Retorno";
import Visualizacao from "@/components/epic/Visualizacao";
import { CARD_DIMENSAO, HOME } from "@/lib/epic/content/home";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import { formatPrice } from "@/lib/epic/products";
import { metadados, ORGANIZACAO, WEBSITE } from "@/lib/epic/seo";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { listarProdutos } from "@/lib/epic/server/produtos";
import { dimensoesNavegaveis } from "@/lib/epic/site";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

// SEO da Home (Copy Final §7; Blueprint v1.2 §57.1).
export const metadata: Metadata = metadados({
  titulo: HOME.seo.titulo,
  tituloAbsoluto: true,
  descricao: HOME.seo.descricao,
  caminho: "/",
  ogTitulo: HOME.seo.ogTitulo,
  ogDescricao: HOME.seo.ogDescricao,
});

// Tensão-mãe (Posicionamento §2): as formas que a distância assume. Aprovado.
const TENSOES = [
  "tenho tudo para estar bem, mas não estou",
  "sei o que quero, mas não começo",
  "começo e não sustento",
  "minha vida funciona, mas não me entusiasma",
  "estou cansado o tempo inteiro",
  "tenho medo de tomar uma decisão",
  "quero mudar, mas não sei por onde",
  "quero mais, mas ainda não sei exatamente mais o quê",
];

const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as React.CSSProperties;

/** Circula à mão uma palavra do título (uma marcação por tela, Brand §9). */
function tituloComMarca(titulo: string, palavra: string) {
  const i = titulo.indexOf(palavra);
  if (i < 0) return titulo;
  return (
    <>
      {titulo.slice(0, i)}
      <MarcaMao tipo="circulo" atraso={400} rolagem>{palavra}</MarcaMao>
      {titulo.slice(i + palavra.length)}
    </>
  );
}

function Sobretitulo({ children, escuro = false }: { children: React.ReactNode; escuro?: boolean }) {
  return <p className={`revelar mb-4 font-display text-lg italic ${escuro ? "text-latao" : "text-latao-escuro"}`}>{children}</p>;
}

export default async function Home() {
  const [ideias, settings, produtos] = await Promise.all([listarConteudos({ limite: 4 }), getSettings(), listarProdutos()]);
  const dims = dimensoesNavegaveis();
  const preco = (id: string | null) => {
    if (!id) return "Gratuito";
    const p = produtos.find((x) => x.product_id === id);
    return p ? formatPrice(p.price_list) : null;
  };

  return (
    <>
      <Visualizacao nome="ViewHome" />
      <JsonLd dados={[ORGANIZACAO, WEBSITE]} />
      <Retorno />

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.5fr_1fr] lg:gap-20 lg:pb-28">
          <div>
            <h1 className="entrada font-display text-[2.4rem] font-normal leading-[1.08] text-grafite sm:text-[3.6rem] lg:text-[4.1rem]">
              Tem uma distância entre a vida que você vive e a vida que{" "}
              <MarcaMao atraso={900}>sabe que poderia viver</MarcaMao>?
            </h1>
            <div className="entrada mt-8 max-w-xl space-y-1 text-lg leading-relaxed text-grafite/80" style={atraso(180)}>
              {HOME.hero.subtexto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <div className="entrada mt-10 flex flex-wrap items-center gap-x-8 gap-y-5" style={atraso(320)}>
              <PrimaryCTA href="/mapa">{HOME.hero.ctaPrimario}</PrimaryCTA>
              <TextCTA href="#entenda">{HOME.hero.ctaSecundario}</TextCTA>
            </div>
            <p className="entrada mt-4 text-sm text-mineral-escuro" style={atraso(420)}>
              {HOME.hero.micro}
            </p>
          </div>

          <aside aria-label="Formas que essa distância assume" className="paralaxe self-end" style={{ "--paralaxe": "22px" } as React.CSSProperties}>
            <p className="entrada-suave mb-5 max-w-xs font-display text-lg italic text-mineral-escuro" style={atraso(500)}>
              {HOME.hero.lateral}
            </p>
            <ul className="space-y-3 border-l border-latao pl-5">
              {TENSOES.map((t, i) => (
                <li key={t} className="entrada font-display text-[1.15rem] leading-snug text-grafite/85" style={atraso(600 + i * 110)}>
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
          <p className="revelar mt-6 max-w-2xl text-lg leading-relaxed text-grafite/75">{HOME.reconhecimento.subtitulo}</p>
          <div className="revelar mt-10 max-w-2xl space-y-1 font-display text-[1.25rem] leading-snug text-grafite/90">
            {HOME.reconhecimento.abertura.map((t) => <p key={t}>{t}</p>)}
          </div>
          <ul className="revelar-lista mt-14 grid gap-x-14 gap-y-8 md:grid-cols-2">
            {HOME.reconhecimento.cenas.map((c) => (
              <li key={c} className="border-l border-latao pl-5 font-display text-[1.3rem] leading-[1.4] text-grafite/90">
                {c}
              </li>
            ))}
          </ul>
          <div className="revelar mt-14 max-w-2xl text-lg leading-relaxed text-grafite/80">
            {HOME.reconhecimento.fechamento.map((t) => <p key={t}>{t}</p>)}
          </div>
        </Container>
      </section>

      {/* 3 · Descoberta do mecanismo */}
      <section id="entenda" className="scroll-mt-24">
        <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <Sobretitulo>{HOME.mecanismo.eyebrow}</Sobretitulo>
            <SectionTitle numero="02">{HOME.mecanismo.titulo}</SectionTitle>
            <ul className="revelar-lista mt-10 space-y-3 text-lg leading-relaxed text-grafite/80">
              {HOME.mecanismo.tentativas.map((t) => (
                <li key={t} className="flex gap-4">
                  <span aria-hidden className="mt-[0.8em] h-px w-4 shrink-0 bg-latao" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-end">
            <div className="revelar space-y-2 font-display text-[1.35rem] leading-snug text-grafite">
              {HOME.mecanismo.ideia.map((t, i) => (
                <p key={t} className={i === 0 ? "text-lg italic text-mineral-escuro" : ""}>
                  {t}
                </p>
              ))}
            </div>
            <div className="revelar mt-8 border-t border-linha pt-6 text-lg leading-relaxed text-grafite/80">
              <p>
                <MarcaMao rolagem>{HOME.mecanismo.infraestrutura[0]}</MarcaMao>
              </p>
              <p className="mt-2">{HOME.mecanismo.infraestrutura[1]}</p>
            </div>
            <div className="mt-8">
              <TextCTA href="#dimensoes">{HOME.mecanismo.cta}</TextCTA>
            </div>
          </div>
        </Container>
      </section>

      {/* 4 · As 10 dimensões: pergunta + uma linha + CTA (Copy Final §8) */}
      {dims.length > 0 && (
        <section id="dimensoes" className="scroll-mt-24 border-t border-linha">
          <Container className="py-20 sm:py-28">
            <SectionTitle numero="03" className="max-w-2xl">
              {HOME.dimensoes.titulo}
            </SectionTitle>
            <p className="revelar mt-5 max-w-xl text-lg text-grafite/75">{HOME.dimensoes.subtitulo}</p>
            <ol className="revelar-lista mt-14 grid border-t border-linha sm:grid-cols-2 lg:grid-cols-5">
              {dims.map((d) => {
                const card = CARD_DIMENSAO[d.id];
                return (
                  <li key={d.id} className="border-b border-linha sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(5n)]:border-r-0">
                    <Link href={d.href} className="group flex h-full flex-col p-6 transition-colors hover:bg-papel-claro lg:px-5">
                      <span className="font-mono text-xs text-latao-escuro">{String(d.order).padStart(2, "0")}</span>
                      <span className="mt-3 font-display text-[1.45rem] leading-tight text-grafite transition-transform duration-500 [transition-timing-function:var(--ease-saida)] group-hover:translate-x-1 lg:whitespace-nowrap lg:text-[1.08rem] xl:text-[1.26rem]">{d.name}</span>
                      <span className="mt-3 font-display text-[1.02rem] italic leading-snug text-grafite/85">{card.pergunta}</span>
                      <span className="mt-2 text-[14px] leading-snug text-mineral-escuro">{card.texto}</span>
                      <span className="mt-auto flex items-center gap-2 pt-6 text-[13px] font-medium text-grafite/80 group-hover:text-tinta">
                        Explorar {d.name}
                        <span aria-hidden className="block h-px w-5 bg-latao transition-all duration-300 group-hover:w-10" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <p className="revelar mt-10 font-display text-[1.3rem] italic text-grafite/85">{HOME.dimensoes.fechamento}</p>
          </Container>
        </section>
      )}

      {/* 5 · Mapa de Fricção */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <Sobretitulo escuro>{HOME.mapa.eyebrow}</Sobretitulo>
            <SectionTitle numero="04" escuro>
              {tituloComMarca(HOME.mapa.titulo, "fricção")}
            </SectionTitle>
            <div className="mt-6 max-w-xl space-y-2 text-lg leading-relaxed text-papel/75">
              {HOME.mapa.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <p className="mt-8 text-[15px] text-papel/70">{HOME.mapa.listaIntro}</p>
            <ul className="revelar-lista mt-3 space-y-2 font-display text-[1.2rem] text-papel">
              {HOME.mapa.lista.map((t) => (
                <li key={t} className="flex gap-4">
                  <span aria-hidden className="mt-[0.75em] h-px w-4 shrink-0 bg-latao" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:justify-self-end">
            <div className="mb-10">
              <SinalFriccao />
            </div>
            <dl className="mb-8 grid grid-cols-3 gap-6 border-t border-papel/15 pt-5 font-mono text-xs text-papel/60">
              <div>
                <dt>perguntas</dt>
                <dd className="mt-1 font-display text-3xl text-papel">7</dd>
              </div>
              <div>
                <dt>resultado</dt>
                <dd className="mt-1 font-display text-3xl text-papel">imediato</dd>
              </div>
              <div>
                <dt>Mapa</dt>
                <dd className="mt-1 font-display text-3xl text-papel">gratuito</dd>
              </div>
            </dl>
            <PrimaryCTA href="/mapa" escuro>
              {HOME.mapa.cta}
            </PrimaryCTA>
            <p className="mt-4 text-sm text-papel/60">{HOME.mapa.micro}</p>
          </div>
        </Container>
      </section>

      {/* 6 · Como o EPIC247 funciona */}
      <section>
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="05" className="max-w-3xl">
            {HOME.comoFunciona.titulo}
          </SectionTitle>
          <ol className="revelar-lista mt-14 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
            {HOME.comoFunciona.passos.map((p, i) => (
              <li key={p.nome} className="border-t border-grafite/80 pt-5">
                <span className="font-mono text-xs text-latao-escuro">Passo {i + 1}</span>
                <span className="mt-2 block font-display text-[1.5rem] text-grafite">{p.nome}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-mineral-escuro">{p.texto}</span>
              </li>
            ))}
          </ol>
          <div className="revelar mt-14 font-display text-[1.35rem] italic leading-snug text-grafite/85">
            {HOME.comoFunciona.fechamento.map((t) => <p key={t}>{t}</p>)}
          </div>
        </Container>
      </section>

      {/* 7 · Portas de entrada: lista editorial, não vitrine (Copy Final §8) */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="py-20 sm:py-28">
          <SectionTitle numero="06" className="max-w-2xl">
            {HOME.portas.titulo}
          </SectionTitle>
          <p className="revelar mt-5 max-w-xl text-lg text-grafite/75">{HOME.portas.subtitulo}</p>
          <ol className="revelar-lista mt-14 divide-y divide-linha border-y border-linha">
            {HOME.portas.cards.map((c) => {
              const valor = preco(c.product);
              return (
                <li key={c.titulo}>
                  <Link href={c.href} className="group grid gap-3 py-7 md:grid-cols-[16rem_9rem_1fr_auto] md:items-baseline md:gap-8">
                    <span className="font-display text-[1.45rem] leading-tight text-grafite">{c.titulo}</span>
                    <span className="font-mono text-sm text-latao-escuro">
                      {c.prefixo && valor ? `${c.prefixo} ` : ""}
                      {valor}
                    </span>
                    <span className="max-w-xl text-[15px] leading-relaxed text-mineral-escuro">{c.texto}</span>
                    <span className="flex items-center gap-2 text-[14px] font-medium text-grafite/85 group-hover:text-tinta">
                      {c.cta}
                      <span aria-hidden className="block h-px w-5 bg-latao transition-all duration-300 group-hover:w-9" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* 8 · Protocolo */}
      <section>
        <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Sobretitulo>{HOME.protocolo.eyebrow}</Sobretitulo>
            <SectionTitle numero="07">{HOME.protocolo.titulo}</SectionTitle>
            <div className="mt-6 max-w-md space-y-2 text-lg leading-relaxed text-grafite/80">
              {HOME.protocolo.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <ul className="revelar-lista mt-8 max-w-md space-y-1.5 font-display text-[1.15rem] italic text-grafite/85">
              {HOME.protocolo.cadeia.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="revelar mt-8 max-w-md text-lg leading-relaxed text-grafite/80">{HOME.protocolo.fechamento}</p>
            <div className="mt-10">
              <PrimaryCTA href="/protocolo">{HOME.protocolo.cta}</PrimaryCTA>
            </div>
          </div>
          <ol className="revelar-lista self-center border-t border-linha">
            {DIMENSION_IDS.map((id, i) => (
              <li key={id} className="flex items-baseline gap-4 border-b border-linha py-3">
                <span className="font-mono text-[11px] text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[1.2rem] text-grafite">{DIMENSIONS[id].name}</span>
                <span className="ml-auto hidden text-[14px] text-mineral-escuro sm:inline">{DIMENSIONS[id].manifestoLine}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 9 · Ideias */}
      <section className="border-t border-linha">
        <Container className="py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <Sobretitulo>{HOME.ideias.eyebrow}</Sobretitulo>
              <SectionTitle numero="08">{HOME.ideias.titulo}</SectionTitle>
            </div>
            <div className="revelar space-y-2 text-lg leading-relaxed text-grafite/80">
              {HOME.ideias.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
          <ul className="revelar-lista mt-10 flex flex-wrap gap-x-8 gap-y-3 border-y border-linha py-5">
            {HOME.ideias.categorias.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="font-display text-xl text-grafite hover:underline hover:decoration-latao hover:underline-offset-4">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
          {ideias.length > 0 && (
            <div className="mt-12">
              <IdeiasLista itens={ideias} />
            </div>
          )}
          <div className="mt-10">
            <TextCTA href="/ideias">{HOME.ideias.cta}</TextCTA>
          </div>
        </Container>
      </section>

      {/* 10 · Ju */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid items-center gap-12 py-20 sm:py-28 md:grid-cols-[18rem_1fr] md:gap-16">
          {settings.juPhotoUrl ? (
            <div className="imagem-assenta relative aspect-[4/5] w-full max-w-[18rem] overflow-hidden rounded-[var(--radius-epic)]">
              <Image src={settings.juPhotoUrl} alt="Ju Ferreira" fill sizes="18rem" className="object-cover grayscale-[15%]" />
            </div>
          ) : (
            <div aria-hidden className="hidden md:block" />
          )}
          <div>
            <Sobretitulo escuro>{HOME.ju.eyebrow}</Sobretitulo>
            <p className="revelar font-display text-[1.6rem] leading-[1.3] text-papel sm:text-[2.1rem]">{HOME.ju.titulo}</p>
            <div className="mt-8 max-w-2xl space-y-3 text-[17px] leading-relaxed text-papel/75">
              {HOME.ju.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <div className="mt-8">
              <TextCTA href="/ju" escuro>
                {HOME.ju.cta}
              </TextCTA>
            </div>
          </div>
        </Container>
      </section>

      {/* 11 · Fechamento */}
      <section className="grao">
        <Container estreito className="py-24 text-center sm:py-28">
          <p className="revelar font-display text-[2rem] leading-snug text-grafite sm:text-[2.7rem]">{HOME.fechamento.titulo}</p>
          <p className="revelar mx-auto mt-5 max-w-xl text-lg text-grafite/75">{HOME.fechamento.subtitulo}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <PrimaryCTA href="/mapa">{HOME.fechamento.ctaPrimario}</PrimaryCTA>
            <TextCTA href="/dimensoes">{HOME.fechamento.ctaSecundario}</TextCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
