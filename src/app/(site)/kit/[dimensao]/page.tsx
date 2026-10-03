import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BotaoCheckout from "@/components/epic/BotaoCheckout";
import { Escada, Faq, Lista, Paragrafos, SecaoTexto } from "@/components/epic/BlocosProduto";
import JsonLd from "@/components/epic/JsonLd";
import { CapasKit } from "@/components/epic/ObjetosEditoriais";
import Visualizacao from "@/components/epic/Visualizacao";
import { Container, DraftRibbon, SectionTitle, TextCTA } from "@/components/epic/ui";
import { CARD_DIMENSAO } from "@/lib/epic/content/home";
import { MICRO } from "@/lib/epic/content/microcopy";
import { KIT_PAGINA as K } from "@/lib/epic/content/paginas-produto";
import { FUNCAO_KIT } from "@/lib/epic/content/produtos";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { formatPrice } from "@/lib/epic/products";
import { metadados, NAO_INDEXAR, produtoLd } from "@/lib/epic/seo";
import { ofertasPermitidas, perfilAtual } from "@/lib/epic/server/perfil";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, mapaVisivel } from "@/lib/epic/site";

type Props = { params: Promise<{ dimensao: string }>; searchParams: Promise<{ r?: string }> };

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

// Copy Final §26.14 e Blueprint v1.2 §57.7.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  const nome = DIMENSIONS[dimensao].name;
  const base = metadados({ titulo: K.seo.titulo(nome), tituloAbsoluto: true, descricao: K.seo.descricao(nome), caminho: `/kit/${dimensao}` });
  // Produto fora de venda pode existir para QA, mas não entra na busca (NC-12).
  const p = (await listarProdutos()).find((x) => x.product_id === `kit_${dimensao}`);
  return vendavel(p) ? base : { ...base, robots: NAO_INDEXAR };
}

const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export default async function KitPage({ params, searchParams }: Props) {
  const { dimensao } = await params;
  const { r } = await searchParams;
  if (!isDimensionId(dimensao)) notFound();
  const d = DIMENSIONS[dimensao];
  const [produtos, perfil] = await Promise.all([listarProdutos(), perfilAtual()]);
  const p = produtos.find((x) => x.product_id === `kit_${dimensao}`);
  // Kit aparece com a dimensão ou o Mapa no ar, ou quando já está à venda.
  if (!p || !(dimensaoVisivel(dimensao) || mapaVisivel(dimensao) || vendavel(p))) notFound();
  const preco = (id: string) => {
    const x = produtos.find((y) => y.product_id === id);
    return x ? formatPrice(x.price_list) : null;
  };
  const regras = ofertasPermitidas(perfil, dimensao);
  const podeComprar = regras.kit;

  const compra = podeComprar ? (
    <BotaoCheckout productId={p.product_id} rotulo={K.cta(d.name)} disponivel={vendavel(p)} />
  ) : (
    <div>
      <p className="font-display text-xl text-grafite">{MICRO.pagamento.jaTemTitulo}</p>
      <p className="mt-2 text-grafite/75">
        {regras.jaTemProtocolo ? `O Protocolo já inclui ${d.name}. ` : ""}
        {MICRO.pagamento.jaTemTexto} O acesso está no seu e-mail.
      </p>
    </div>
  );

  return (
    <>
      <Visualizacao nome="ViewKitOffer" dados={{ product_id: p.product_id, dimension: dimensao }} />
      <JsonLd dados={produtoLd(p, `/kit/${dimensao}`, K.seo.descricao(d.name))} />
      {!vendavel(p) && <DraftRibbon texto="Este produto ainda não está à venda (sem checkout ativo)." />}

      {/* 1 · Hero */}
      <section className="grao border-b border-linha">
        <Container className="grid gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="entrada-suave font-mono text-sm text-latao-escuro">{K.eyebrow(d.name)}</p>
            <h1 className="entrada mt-4 font-display text-[2.3rem] font-normal leading-[1.1] text-grafite sm:text-[3.2rem]">
              {K.titulo(d.name)}
            </h1>
            <p className="entrada mt-6 max-w-xl text-lg leading-relaxed text-grafite/75" style={{ "--atraso": "160ms" } as React.CSSProperties}>
              {K.sub(d.name)}
            </p>
            {r && <p className="mt-6 max-w-xl font-display text-[1.15rem] italic text-grafite">{K.contexto(d.name)}</p>}
            <p className="mt-8">
              <TextCTA href="#incluido">{K.cta2}</TextCTA>
            </p>
          </div>
          <div className="flex flex-col gap-12 self-end">
            <div className="flex justify-center lg:justify-start">
              <CapasKit dimensao={dimensao} />
            </div>
            <div className="rounded-[var(--radius-epic)] border border-linha bg-papel-claro p-8">
              <p className="font-display text-5xl text-grafite">{formatPrice(p.price_list)}</p>
              <p className="mt-2 text-sm text-mineral-escuro">{K.oferta.pagamento}</p>
              <div className="mt-8">{compra}</div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 · Reconhecimento */}
      <section className="bg-papel-escuro">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="01" className="max-w-3xl">
            {K.reconhecimento.titulo}
          </SectionTitle>
          <div className="revelar mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-grafite/80">
            <p className="font-display text-[1.25rem] text-grafite">{K.reconhecimento.tensao(minuscula(CARD_DIMENSAO[dimensao].texto))}</p>
            <p>{K.reconhecimento.texto}</p>
          </div>
          <p className="revelar mt-10 font-display text-[1.3rem] italic text-grafite">{K.reconhecimento.fechamento}</p>
        </Container>
      </section>

      {/* 3 · O que é o Kit */}
      <section>
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="02" className="max-w-2xl">
            {K.camadas.titulo}
          </SectionTitle>
          <ol className="revelar-lista mt-12 grid gap-10 md:grid-cols-3">
            {K.camadas.itens.map((c, i) => (
              <li key={c.nome} className="border-t border-grafite/80 pt-5">
                <span className="font-mono text-xs text-latao-escuro">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-2 block font-display text-[1.5rem] text-grafite">{c.nome}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-mineral-escuro">{c.texto}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 4 · Da compreensão para a prática */}
      <SecaoTexto numero="03" titulo={K.pratica.titulo} fundo="border-y border-linha bg-papel-claro">
        <Paragrafos linhas={K.pratica.texto} />
        <p className="mt-8 font-display text-[1.5rem] text-grafite">{K.pratica.destaque}</p>
      </SecaoTexto>

      {/* 5 e 6 · Para quem / a escada não obriga */}
      <section>
        <Container className="grid gap-14 py-20 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionTitle numero="04">{K.paraQuem.titulo}</SectionTitle>
            <Lista itens={K.paraQuem.itens} className="mt-8" />
          </div>
          <div>
            <SectionTitle numero="05">{K.escada.titulo}</SectionTitle>
            <Paragrafos linhas={K.escada.texto} className="mt-8 text-[17px]" />
          </div>
        </Container>
      </section>

      {/* 7 · Kit x Plano x Protocolo (Protocolo nunca como "10 Kits com desconto") */}
      <section className="bg-papel-escuro">
        <Container className="py-20 sm:py-24">
          <SectionTitle numero="06" className="max-w-3xl">
            {K.comparacao.titulo}
          </SectionTitle>
          <Escada
            opcoes={[
              { nome: "Plano EPIC 7 Dias", preco: preco(`plan_${dimensao}`), texto: K.comparacao.plano, href: `/plano/${dimensao}`, cta: "Conhecer o Plano" },
              { nome: `Kit EPIC ${d.name}`, preco: preco(p.product_id), texto: K.comparacao.kit, href: "#oferta", cta: "", atual: true },
              { nome: "Protocolo EPIC247", preco: preco("protocol"), texto: K.comparacao.protocolo, href: "/protocolo", cta: "Conhecer o Protocolo" },
            ].filter((o) => o.atual || (o.href.startsWith("/plano") ? regras.plano : regras.protocolo))}
          />
        </Container>
      </section>

      {/* 8 · O que você recebe (só o que existe de fato no produto) */}
      <SecaoTexto numero="07" titulo={K.recebe.titulo(d.name)} id="incluido">
        <Lista itens={K.recebe.itens(d.name)} />
        <p className="mt-8 text-[15px] leading-relaxed text-mineral-escuro">Para {FUNCAO_KIT[dimensao]}</p>
      </SecaoTexto>

      {/* 9 e 10 · Como usar / limites */}
      <section className="border-y border-linha bg-papel-claro">
        <Container className="grid gap-14 py-20 sm:py-24 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionTitle numero="08">{K.comoUsar.titulo}</SectionTitle>
            <Paragrafos linhas={K.comoUsar.texto} className="mt-8 text-[17px]" />
          </div>
          <div>
            <SectionTitle numero="09">{K.limites.titulo}</SectionTitle>
            <Paragrafos linhas={K.limites.texto(d.name)} className="mt-8 text-[17px]" />
          </div>
        </Container>
      </section>

      {/* 11 · Oferta */}
      <section id="oferta" className="grao scroll-mt-24 bg-tinta text-papel">
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-sm text-latao">{K.oferta.eyebrow(d.name)}</p>
            <p className="mt-4 font-display text-[2rem] leading-tight sm:text-[2.6rem]">{K.oferta.titulo}</p>
            <p className="mt-5 text-papel/75">{K.oferta.inclui}</p>
          </div>
          <div>
            <p className="font-display text-5xl">{formatPrice(p.price_list)}</p>
            <p className="mt-2 text-sm text-papel/60">{K.oferta.pagamento}</p>
            {podeComprar && (
              <div className="mt-8">
                <BotaoCheckout productId={p.product_id} rotulo={K.cta(d.name)} disponivel={vendavel(p)} escuro />
              </div>
            )}
            <p className="mt-4 text-sm text-papel/60">{K.oferta.micro}</p>
          </div>
        </Container>
      </section>

      {/* 12 · FAQ */}
      <section>
        <Container estreito className="py-20 sm:py-24">
          <SectionTitle numero="10" className="mb-10">
            Perguntas frequentes
          </SectionTitle>
          <Faq itens={K.faq(d.name)} />
          {mapaVisivel(dimensao) && (
            <p className="mt-10">
              <TextCTA href={mapPath(dimensao)}>{MICRO.mapa.fazerDimensao(d.name)}</TextCTA>
            </p>
          )}
        </Container>
      </section>

      {/* 13 · Fechamento */}
      <section className="border-t border-linha bg-papel-claro">
        <Container estreito className="py-20 text-center sm:py-24">
          <p className="revelar font-display text-[1.8rem] leading-snug text-grafite sm:text-[2.3rem]">{K.fechamento.titulo}</p>
          <Paragrafos linhas={K.fechamento.texto} className="mx-auto mt-5 max-w-xl" />
          <div className="mt-10 flex flex-col items-center gap-6">
            {podeComprar && <BotaoCheckout productId={p.product_id} rotulo={K.cta(d.name)} disponivel={vendavel(p)} />}
            {regras.protocolo && <TextCTA href="/protocolo">{K.fechamento.cta2}</TextCTA>}
          </div>
        </Container>
      </section>
    </>
  );
}
