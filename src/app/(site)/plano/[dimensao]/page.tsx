import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import { Escada, Faq, Lista, Paragrafos, SecaoTexto } from "@/components/epic/BlocosProduto";
import JsonLd from "@/components/epic/JsonLd";
import { SeteDias } from "@/components/epic/ObjetosEditoriais";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, DraftRibbon, SectionTitle } from "@/components/epic/ui";
import { MICRO } from "@/lib/epic/content/microcopy";
import { PLANO_PAGINA as P } from "@/lib/epic/content/paginas-produto";
import { ESTRUTURA_PLANO } from "@/lib/epic/content/produtos";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { getDimensionalMap } from "@/lib/epic/maps";
import { formatPrice } from "@/lib/epic/products";
import { metadados, produtoLd } from "@/lib/epic/seo";
import { withTx } from "@/lib/epic/server/db";
import { resultadoPorToken } from "@/lib/epic/server/mapas";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, mapaVisivel } from "@/lib/epic/site";

type Props = { params: Promise<{ dimensao: string }>; searchParams: Promise<{ r?: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

// Copy Final §25.11 e Blueprint v1.2 §57.6.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  const nome = DIMENSIONS[dimensao].name;
  return metadados({ titulo: P.seo.titulo(nome), tituloAbsoluto: true, descricao: P.seo.descricao(nome), caminho: `/plano/${dimensao}` });
}

/** Eixo prioritário do resultado que trouxe a pessoa até aqui (sem expor respostas). */
async function eixoDoResultado(token: string | undefined, dimensao: string): Promise<string | null> {
  if (!token || !isDimensionId(dimensao)) return null;
  const r = await withTx((q) => resultadoPorToken(q, token)).catch(() => null);
  if (!r || r.map_type !== dimensao) return null;
  const chave = r.chosen_pattern ?? r.primary_pattern;
  return getDimensionalMap(dimensao).axes.find((a) => a.key === chave)?.label ?? null;
}

export default async function PlanoPage({ params, searchParams }: Props) {
  const { dimensao } = await params;
  const { r } = await searchParams;
  // O Plano nasce do Mapa: existe quando a dimensão ou o Mapa está no ar.
  if (!isDimensionId(dimensao) || !(dimensaoVisivel(dimensao) || mapaVisivel(dimensao))) notFound();
  const d = DIMENSIONS[dimensao];
  const [produtos, perfil, eixo] = await Promise.all([listarProdutos(), perfilAtual(), eixoDoResultado(r, dimensao)]);
  const p = produtos.find((x) => x.product_id === `plan_${dimensao}`);
  if (!p) notFound();
  const preco = (id: string) => {
    const x = produtos.find((y) => y.product_id === id);
    return x ? formatPrice(x.price_list) : null;
  };
  const regras = ofertasPermitidas(perfil, dimensao);
  const jaTem = perfil?.plans_owned.includes(dimensao);

  // Compra já existente ou Protocolo: nada de oferta principal repetida (§27.16).
  const compra = regras.jaTemProtocolo ? (
    <div>
      <p className="font-display text-xl text-grafite">{MICRO.pagamento.jaTemTitulo}</p>
      <p className="mt-2 text-grafite/75">O Protocolo já inclui {d.name}. {MICRO.pagamento.jaTemTexto}</p>
    </div>
  ) : jaTem ? (
    <div>
      <p className="font-display text-xl text-grafite">{MICRO.pagamento.jaTemTitulo}</p>
      <p className="mt-2 text-grafite/75">{MICRO.pagamento.jaTemTexto} O link do seu Plano está no seu e-mail.</p>
    </div>
  ) : (
    <BotaoCheckout productId={p.product_id} token={r} rotulo={P.cta} disponivel={vendavel(p)} />
  );

  return (
    <>
      <Visualizacao nome="ViewPlanOffer" dados={{ product_id: p.product_id, dimension: dimensao }} />
      <JsonLd dados={produtoLd(p, `/plano/${dimensao}`, P.seo.descricao(d.name))} />
      {!vendavel(p) && <DraftRibbon texto="Este produto ainda não está à venda (sem checkout ativo)." />}

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="entrada-suave font-mono text-sm text-latao-escuro">{P.eyebrow(d.name)}</p>
            <h1 className="entrada mt-4 font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3.2rem]">
              {P.titulo}
            </h1>
            <p className="entrada mt-6 max-w-xl text-lg leading-relaxed text-grafite/75" style={{ "--atraso": "160ms" } as React.CSSProperties}>
              {P.sub(d.name)}
            </p>
            {eixo && <p className="mt-6 font-display text-[1.25rem] italic text-grafite">{P.prioritario(eixo)}</p>}
          </div>
          <div className="self-end rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-8">
            <p className="font-display text-5xl text-grafite">{formatPrice(p.price_list)}</p>
            <p className="mt-2 text-sm text-mineral-escuro">{P.oferta.pagamento}</p>
            <div className="mt-8">{compra}</div>
            <p className="mt-4 text-sm text-mineral-escuro">{P.micro}</p>
            {!r && mapaVisivel(dimensao) && !jaTem && !regras.jaTemProtocolo && (
              <p className="mt-6 border-t border-linha pt-5 text-sm leading-relaxed text-mineral-escuro">
                O Plano usa as suas respostas no Mapa de {d.name}. Se ainda não fez,{" "}
                <a href={mapPath(dimensao)} className="underline underline-offset-2">
                  faça o Mapa primeiro
                </a>
                . Se comprar antes, o Plano fica pronto assim que você terminar.
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* 2 · Transição */}
      <SecaoTexto numero="01" titulo={P.transicao.titulo}>
        <Paragrafos linhas={P.transicao.texto} />
      </SecaoTexto>

      {/* 3 · O que você recebe: itens reais do template de geração da dimensão */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionTitle numero="02">{P.recebe.titulo}</SectionTitle>
            <Paragrafos linhas={P.recebe.texto} className="mt-6" />
            <div className="mt-10">
              <SeteDias dias={["Observar", "Nomear", "Reduzir", "Primeiro movimento", "Segundo movimento", "Terceiro movimento", "Revisar"]} />
            </div>
          </div>
          <div>
            <Lista itens={P.recebe.itens} />
            <p className="mt-10 font-mono text-xs text-latao-escuro">No Plano de {d.name}</p>
            <ol className="revelar-lista mt-3 border-t border-linha">
              {ESTRUTURA_PLANO[dimensao].map((item, i) => (
                <li key={item} className="flex gap-4 border-b border-linha py-3">
                  <span className="pt-1 font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[16px] text-grafite">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* 4 · Personalização */}
      <SecaoTexto numero="03" titulo={P.personalizacao.titulo}>
        <Paragrafos linhas={P.personalizacao.texto(d.name)} />
        <p className="mt-8 traco-lateral pl-5 font-display text-[1.15rem] italic text-grafite">{P.personalizacao.selo}</p>
      </SecaoTexto>

      {/* 5 e 6 · Para quem faz sentido / quando não é o melhor passo */}
      <section className="bg-papel-escuro">
        <Container className="grid gap-14 py-20 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionTitle numero="04">{P.paraQuem.titulo}</SectionTitle>
            <Lista itens={P.paraQuem.itens} className="mt-8" />
          </div>
          <div>
            <SectionTitle numero="05">{P.limites.titulo}</SectionTitle>
            <Paragrafos linhas={P.limites.texto} className="mt-8 text-[17px]" />
          </div>
        </Container>
      </section>

      {/* 7 · Plano, Kit ou Protocolo */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="06" className="max-w-3xl">
            {P.comparacao.titulo}
          </SectionTitle>
          <Escada
            opcoes={[
              { nome: "Plano EPIC 7 Dias", preco: preco(p.product_id), texto: P.comparacao.plano.texto, href: "#oferta", cta: P.comparacao.plano.cta, atual: true },
              { nome: `Kit EPIC ${d.name}`, preco: preco(`kit_${dimensao}`), texto: P.comparacao.kit.texto, href: `/kit/${dimensao}`, cta: P.comparacao.kit.cta },
              { nome: "Protocolo EPIC247", preco: preco("protocol"), texto: P.comparacao.protocolo.texto, href: "/protocolo", cta: P.comparacao.protocolo.cta },
            ].filter((o) => o.atual || (o.href.startsWith("/kit") ? regras.kit : regras.protocolo))}
          />
        </Container>
      </section>

      {/* 8 · Oferta */}
      <section id="oferta" className="grao scroll-mt-24 bg-tinta text-papel">
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="font-display text-[2rem] leading-tight sm:text-[2.6rem]">{P.oferta.titulo}</p>
            <p className="mt-5 font-mono text-sm text-latao">{P.oferta.produto(d.name)}</p>
          </div>
          <div>
            <p className="font-display text-5xl">{formatPrice(p.price_list)}</p>
            <p className="mt-2 text-sm text-papel/60">{P.oferta.pagamento}</p>
            {!jaTem && !regras.jaTemProtocolo && (
              <div className="mt-8">
                <BotaoCheckout productId={p.product_id} token={r} rotulo={P.cta} disponivel={vendavel(p)} escuro />
              </div>
            )}
            <p className="mt-4 text-sm text-papel/60">{P.oferta.micro(d.name)}</p>
          </div>
        </Container>
      </section>

      {/* 9 · FAQ */}
      <section>
        <Container estreito className="py-20 sm:py-24">
          <SectionTitle numero="07" className="mb-10">
            Perguntas frequentes
          </SectionTitle>
          <Faq itens={P.faq} />
        </Container>
      </section>

      {/* 10 · Fechamento */}
      <section className="border-t border-linha bg-papel-claro">
        <Container estreito className="py-20 text-center sm:py-24">
          <p className="revelar font-display text-[1.8rem] leading-snug text-grafite sm:text-[2.3rem]">{P.fechamento.titulo}</p>
          <Paragrafos linhas={P.fechamento.texto} className="mx-auto mt-5 max-w-xl" />
          {!jaTem && !regras.jaTemProtocolo && (
            <div className="mt-10 flex justify-center">
              <BotaoCheckout productId={p.product_id} token={r} rotulo={P.cta} disponivel={vendavel(p)} />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
