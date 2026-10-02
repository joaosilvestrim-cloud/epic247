import type { Metadata } from "next";
import Link from "next/link";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import { Faq, Lista, Paragrafos } from "@/components/epic/BlocosProduto";
import Depoimentos from "@/components/epic/Depoimentos";
import JsonLd from "@/components/epic/JsonLd";
import MarcaMao from "@/components/epic/MarcaMao";
import { EstanteProtocolo } from "@/components/epic/ObjetosEditoriais";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, PrimaryCTA, SectionTitle, TextCTA } from "@/components/epic/ui";
import { MICRO } from "@/lib/epic/content/microcopy";
import { DIMENSAO_NO_PROTOCOLO, PROTOCOLO_PAGINA as P } from "@/lib/epic/content/protocolo";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import { formatPrice } from "@/lib/epic/products";
import { metadados, produtoLd } from "@/lib/epic/seo";
import { perfilAtual } from "@/lib/epic/server/perfil";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoHref } from "@/lib/epic/site";

export const revalidate = 60;

// SEO da Copy Final §20; Product só com preço sincronizado (Blueprint v1.2 §57.8).
export const metadata: Metadata = metadados({
  titulo: P.seo.titulo,
  tituloAbsoluto: true,
  descricao: P.seo.descricao,
  caminho: "/protocolo",
  ogTitulo: P.seo.ogTitulo,
  ogDescricao: P.seo.ogDescricao,
});

function Sobretitulo({ children, escuro = false }: { children: React.ReactNode; escuro?: boolean }) {
  return <p className={`revelar mb-4 font-display text-lg italic ${escuro ? "text-latao" : "text-latao-escuro"}`}>{children}</p>;
}

export default async function ProtocoloPage() {
  const [produtos, perfil] = await Promise.all([listarProdutos(), perfilAtual()]);
  const p = produtos.find((x) => x.product_id === "protocol") ?? null;
  const kitPreco = produtos.find((x) => x.product_type === "kit")?.price_list;
  const jaTem = Boolean(perfil?.protocol_purchased);

  // Comprador do Protocolo não vê a compra de novo como CTA principal (§27.31).
  const compra = jaTem ? (
    <div>
      <p className="font-display text-xl">{MICRO.pagamento.jaTemTitulo}</p>
      <p className="mt-2 opacity-75">{MICRO.pagamento.jaTemTexto} As orientações de acesso estão no seu e-mail.</p>
    </div>
  ) : (
    p && <BotaoCheckout productId="protocol" rotulo={P.oferta.cta} disponivel={vendavel(p)} escuro />
  );

  return (
    <>
      <Visualizacao nome="ViewProtocolOffer" dados={{ product_id: "protocol" }} />
      {p && <JsonLd dados={produtoLd(p, "/protocolo", P.seo.descricao)} />}

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="entrada-suave font-mono text-sm text-latao-escuro">{P.hero.eyebrow}</p>
            <h1 className="entrada mt-4 max-w-4xl font-display text-[2.5rem] font-normal leading-[1.06] text-grafite sm:text-[3.8rem]">
              10 dimensões. Um sistema para construir a vida que <MarcaMao atraso={900}>você escolhe</MarcaMao>.
            </h1>
            <div className="entrada mt-8 max-w-2xl space-y-2 text-lg leading-relaxed text-grafite/80" style={{ "--atraso": "180ms" } as React.CSSProperties}>
              {P.hero.sub.map((t) => <p key={t}>{t}</p>)}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <PrimaryCTA href="#oferta">{P.hero.cta}</PrimaryCTA>
              <TextCTA href="#dimensoes">{P.hero.cta2}</TextCTA>
            </div>
            <p className="mt-4 max-w-xl text-sm text-mineral-escuro">{P.hero.micro}</p>
          </div>
          <EstanteProtocolo />
        </Container>
      </section>

      {/* 2 · Reconhecimento */}
      <section className="bg-papel-escuro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionTitle numero="01">{P.reconhecimento.titulo}</SectionTitle>
            <ol className="revelar-lista mt-10 space-y-2 border-l border-latao pl-5 font-display text-[1.2rem] leading-snug text-grafite/90">
              {P.reconhecimento.cadeia.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </div>
          <div className="self-end">
            <Paragrafos linhas={P.reconhecimento.texto} />
            <Lista itens={P.reconhecimento.formas} className="mt-4" />
            <div className="revelar mt-10 font-display text-[1.35rem] italic leading-snug text-grafite">
              {P.reconhecimento.fechamento.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
        </Container>
      </section>

      {/* 3 · A tese: Infraestrutura Humana */}
      <section className="grao bg-tinta text-papel">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Sobretitulo escuro>{P.tese.eyebrow}</Sobretitulo>
            <SectionTitle numero="02" escuro>
              {P.tese.titulo}
            </SectionTitle>
            <div className="mt-6 space-y-2 text-lg leading-relaxed text-papel/75">
              {P.tese.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
          <div>
            <ol className="revelar-lista space-y-1.5 font-display text-[1.25rem] text-papel/90 sm:text-[1.4rem]">
              {P.tese.condicoes.map((t, i) => (
                <li key={t} className="flex gap-4">
                  <span className="pt-1.5 font-mono text-xs text-latao">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="revelar mt-10 font-display text-[1.5rem] text-papel">
              <MarcaMao rolagem>{P.tese.destaque}</MarcaMao>
            </p>
            <p className="mt-4 text-[17px] text-papel/75">{P.tese.fechamento}</p>
          </div>
        </Container>
      </section>

      {/* 4 · As 10 dimensões: sequência central, legível no celular */}
      <section id="dimensoes" className="scroll-mt-24">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="03" className="max-w-3xl">
            {P.dimensoes.titulo}
          </SectionTitle>
          <ol className="revelar-lista mt-12 divide-y divide-linha border-y border-linha">
            {DIMENSION_IDS.map((id, i) => {
              const d = DIMENSIONS[id];
              const x = DIMENSAO_NO_PROTOCOLO[id];
              const href = dimensaoHref(id);
              return (
                <li key={id} className="grid gap-2 py-6 md:grid-cols-[3rem_12rem_1fr_auto] md:items-baseline md:gap-8">
                  <span className="font-mono text-sm text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[1.5rem] text-grafite">{d.name}</span>
                  <span>
                    <span className="block font-display text-[1.1rem] italic leading-snug text-grafite/90">{x.pergunta}</span>
                    <span className="mt-1.5 block text-[15px] leading-relaxed text-mineral-escuro">{x.funcao}</span>
                  </span>
                  {href && (
                    <Link href={href} className="text-[14px] font-medium text-grafite/80 hover:text-tinta">
                      Explorar {d.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* 5 · Como o Protocolo funciona */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="py-20 sm:py-24">
          <Sobretitulo>{P.funciona.eyebrow}</Sobretitulo>
          <SectionTitle numero="04" className="max-w-3xl">
            {P.funciona.titulo}
          </SectionTitle>
          <Paragrafos linhas={P.funciona.texto} className="revelar mt-6 max-w-2xl" />
          <ol className="revelar-lista mt-12 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
            {P.funciona.passos.map((s, i) => (
              <li key={s.nome} className="border-t border-grafite/80 pt-5">
                <span className="font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-2 block font-display text-[1.45rem] text-grafite">{s.nome}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-mineral-escuro">{s.texto}</span>
              </li>
            ))}
          </ol>
          <p className="revelar mt-12 font-display text-[1.5rem] text-grafite">{P.funciona.destaque}</p>
        </Container>
      </section>

      {/* 6 · O que está incluído */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle numero="05">{P.incluido.titulo}</SectionTitle>
            <p className="revelar mt-6 max-w-md text-lg leading-relaxed text-grafite/80">{P.incluido.abertura}</p>
          </div>
          <Lista itens={P.incluido.itens} />
        </Container>
      </section>

      {/* 7 · Para quem faz sentido */}
      <section className="bg-papel-escuro">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="06" className="max-w-3xl">
            {P.paraQuem.titulo}
          </SectionTitle>
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="font-mono text-xs text-latao-escuro">Pode fazer sentido para você se</p>
              <Lista itens={P.paraQuem.sim} className="mt-5" />
            </div>
            <div>
              <p className="font-mono text-xs text-latao-escuro">Talvez não seja o melhor primeiro passo se</p>
              <Lista itens={P.paraQuem.nao} className="mt-5" />
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <TextCTA href="/mapa">{P.paraQuem.ctas[0]}</TextCTA>
                <TextCTA href="/mentoria">{P.paraQuem.ctas[1]}</TextCTA>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 8 · Kit ou Protocolo: integração, nunca "10 Kits com desconto" */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="07" className="max-w-3xl">
            {P.kitOuProtocolo.titulo}
          </SectionTitle>
          <div className="revelar-lista mt-12 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha md:grid-cols-2">
            {[
              { nome: "Kit EPIC [Dimensão]", ...P.kitOuProtocolo.kit, preco: kitPreco },
              { nome: "Protocolo EPIC247", ...P.kitOuProtocolo.protocolo, preco: p?.price_list },
            ].map((o, i) => (
              <div key={o.nome} className={`p-8 ${i === 1 ? "bg-papel-claro" : "bg-papel"}`}>
                <p className="font-display text-2xl text-grafite">{o.nome.replace("[Dimensão]", "da dimensão")}</p>
                {o.preco !== undefined && <p className="mt-1 font-mono text-sm text-latao-escuro">{formatPrice(o.preco)}</p>}
                <p className="mt-6 font-mono text-[11px] text-mineral-escuro">Para quem</p>
                <p className="mt-1 text-[16px] text-grafite/85">{o.paraQuem}</p>
                <p className="mt-5 font-mono text-[11px] text-mineral-escuro">Inclui</p>
                <p className="mt-1 text-[16px] text-grafite/85">{o.inclui}</p>
              </div>
            ))}
          </div>
          <Paragrafos linhas={P.kitOuProtocolo.fechamento} className="revelar mt-10 max-w-2xl" />
        </Container>
      </section>

      {/* 9 · Mapas e personalização */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <Sobretitulo>{P.mapas.eyebrow}</Sobretitulo>
            <SectionTitle numero="08">{P.mapas.titulo}</SectionTitle>
          </div>
          <div className="self-end">
            <p className="text-lg leading-relaxed text-grafite/80">{P.mapas.texto}</p>
            <p className="mt-5 text-[15px] text-mineral-escuro">{P.mapas.podeIntro}</p>
            <Lista itens={P.mapas.pode} className="mt-3" />
            <p className="mt-8 border-l border-linha pl-4 text-[13px] leading-relaxed text-mineral-escuro">{P.mapas.importante}</p>
            <div className="mt-8">
              <PrimaryCTA href="/mapa">{P.mapas.cta}</PrimaryCTA>
            </div>
          </div>
        </Container>
      </section>

      {/* 10 · O que o Protocolo não promete */}
      <section>
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionTitle numero="09">{P.naoPromete.titulo}</SectionTitle>
          <div>
            <div className="revelar space-y-1.5 text-lg leading-relaxed text-grafite/80">
              {P.naoPromete.texto.map((t) => <p key={t}>{t}</p>)}
            </div>
            <div className="revelar mt-10 traco-lateral pl-6 font-display text-[1.4rem] leading-snug text-grafite">
              {P.naoPromete.destaque.map((t) => <p key={t}>{t}</p>)}
            </div>
          </div>
        </Container>
      </section>

      <Depoimentos lugar="protocolo" />

      {/* 11 · Oferta */}
      <section id="oferta" className="grao scroll-mt-24 bg-tinta text-papel">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-20">
          <div>
            <p className="font-mono text-sm text-latao">{P.oferta.eyebrow}</p>
            <p className="mt-4 font-display text-[2rem] leading-tight sm:text-[2.7rem]">{P.oferta.titulo}</p>
            <ul className="revelar-lista mt-8 grid gap-x-8 gap-y-2 text-[16px] text-papel/80 sm:grid-cols-2">
              {P.oferta.itens.map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-[0.75em] h-px w-3 shrink-0 bg-latao" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            {p && <p className="font-display text-5xl">{formatPrice(p.price_list)}</p>}
            <p className="mt-2 text-sm text-papel/60">{P.oferta.pagamento}</p>
            <div className="mt-8">{compra}</div>
            <p className="mt-4 text-sm text-papel/60">{P.oferta.micro}</p>
            <p className="mt-6">
              <TextCTA href="/mapa" escuro>
                {P.oferta.cta2}
              </TextCTA>
            </p>
          </div>
        </Container>
      </section>

      {/* 12 · Depois do Protocolo */}
      <section>
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionTitle numero="10">{P.mentoria.titulo}</SectionTitle>
          <div>
            <Paragrafos linhas={P.mentoria.texto} />
            <p className="mt-8">
              <TextCTA href="/mentoria">{P.mentoria.cta}</TextCTA>
            </p>
          </div>
        </Container>
      </section>

      {/* 13 · FAQ */}
      <section className="border-t border-linha">
        <Container estreito className="py-20 sm:py-24">
          <SectionTitle numero="11" className="mb-10">
            Perguntas frequentes
          </SectionTitle>
          <Faq itens={P.faq} />
        </Container>
      </section>

      {/* 14 · Fechamento (a promessa de marca fecha no footer) */}
      <section className="border-t border-linha bg-papel-claro">
        <Container estreito className="py-24 text-center">
          <p className="revelar font-display text-[2rem] leading-snug text-grafite sm:text-[2.6rem]">{P.fechamento.titulo}</p>
          <p className="revelar mx-auto mt-5 max-w-xl text-lg text-grafite/75">{P.fechamento.sub}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            {!jaTem && <PrimaryCTA href="#oferta">{P.fechamento.cta}</PrimaryCTA>}
            <TextCTA href="/mapa">{P.fechamento.cta2}</TextCTA>
          </div>
        </Container>
      </section>
    </>
  );
}
