import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlocoDimensao, type ContextoDimensao } from "@/components/epic/BlocosDimensao";
import JsonLd from "@/components/epic/JsonLd";
import Retorno from "@/components/epic/Retorno";
import Visualizacao from "@/components/epic/Visualizacao";
import { IS_PRODUCTION } from "@/lib/epic/content/copy";
import { paginaDimensao } from "@/lib/epic/content/copy-final";
import { DIMENSAO_CONTEUDO } from "@/lib/epic/content/dimensoes";
import { DIMENSION_IDS, DIMENSIONS, isDimensionId, mapPath } from "@/lib/epic/dimensions";
import { breadcrumbLd, metadados, webPageLd } from "@/lib/epic/seo";
import { listarConteudos } from "@/lib/epic/server/conteudo";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";
import { dimensaoVisivel, dimensionPath, mapaVisivel } from "@/lib/epic/site";

export const revalidate = 60;

export function generateStaticParams() {
  return DIMENSION_IDS.map((dimensao) => ({ dimensao }));
}

type Params = { params: Promise<{ dimensao: string }> };

// SEO da Copy Final (§11 e "SEO — [DIMENSÃO]") e matriz do Blueprint v1.2 §57.2.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao)) return {};
  const seo = paginaDimensao(dimensao).seo;
  return metadados({
    titulo: seo.title ?? DIMENSIONS[dimensao].name,
    tituloAbsoluto: Boolean(seo.title),
    descricao: seo.description ?? DIMENSIONS[dimensao].manifestoLine,
    caminho: dimensionPath(dimensao),
    ogTitulo: seo.ogTitle,
    ogDescricao: seo.ogDescription,
  });
}

export default async function DimensaoPage({ params }: Params) {
  const { dimensao } = await params;
  if (!isDimensionId(dimensao) || !dimensaoVisivel(dimensao)) notFound();

  const d = DIMENSIONS[dimensao];
  const pagina = paginaDimensao(dimensao);
  const [produtos, conteudos] = await Promise.all([listarProdutos(), listarConteudos({ dimensao, limite: 12 })]);
  const acha = (id: string) => produtos.find((p) => p.product_id === id) ?? null;
  // Em produção, oferta só aparece se der para comprar (RF-073).
  const ofertavel = (id: string) => {
    const p = acha(id);
    return vendavel(p) || (!IS_PRODUCTION && p) ? p : null;
  };

  const ctx: ContextoDimensao = {
    dim: dimensao,
    mapaHref: mapaVisivel(dimensao) ? mapPath(dimensao) : "/mapa",
    plano: ofertavel(`plan_${dimensao}`),
    kit: ofertavel(`kit_${dimensao}`),
    protocolo: acha("protocol"),
    // Blueprint §8: articles[] e videos[] no bloco editorial; repertoire[] no Repertório.
    ideias: conteudos.filter((c) => c.content_type !== "repertorio").slice(0, 4),
    repertorio: conteudos.filter((c) => c.content_type === "repertorio").slice(0, 3),
    filmeReserva: DIMENSAO_CONTEUDO[dimensao].filme,
  };

  // A captura pertence ao resultado do Mapa, não à página. Plano e Kit só
  // aparecem quando dá para comprar.
  const blocos = pagina.blocos.filter(
    (b) => b.tipo !== "captura" && !(b.tipo === "plano" && !ctx.plano) && !(b.tipo === "kit" && !ctx.kit)
  );
  let n = 0;
  const numerado = new Set(["hero", "mapa", "fechamento"]);

  return (
    <>
      <Visualizacao nome="ViewDimensionPage" dados={{ dimension: dimensao }} />
      <JsonLd
        dados={[
          webPageLd({ nome: d.name, descricao: pagina.seo.description ?? d.manifestoLine, caminho: dimensionPath(dimensao) }),
          breadcrumbLd([
            { nome: "EPIC247", caminho: "/" },
            { nome: "Dimensões", caminho: "/dimensoes" },
            { nome: d.name, caminho: dimensionPath(dimensao) },
          ]),
        ]}
      />
      <Retorno />
      {blocos.map((b) => {
        const numero = numerado.has(b.tipo) ? undefined : String(++n).padStart(2, "0");
        return <BlocoDimensao key={`${b.n}-${b.tipo}`} b={b} ctx={ctx} numero={numero} />;
      })}
    </>
  );
}
