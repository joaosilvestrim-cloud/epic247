import type { MetadataRoute } from "next";
import { IS_PRODUCTION } from "@/lib/epic/content/copy";
import { legalPublicavel } from "@/lib/epic/content/legal";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import { listarConteudos, TIPO_ROTA } from "@/lib/epic/server/conteudo";
import { listarProdutos, vendavel } from "@/lib/epic/server/produtos";

export const revalidate = 3600;

const BASE = "https://epic247.com.br";

/**
 * Só URLs canônicas, públicas e de fato publicáveis (Blueprint v1.2 §57;
 * auditoria NC-12): páginas legais só depois da aprovação jurídica; Plano e
 * Kit só quando estão à venda (ativo, checkout e, no Plano, conteúdo
 * aprovado). Resultados pessoais, tokens e áreas internas nunca entram.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pub = (id: (typeof DIMENSION_IDS)[number], campo: "page" | "map") =>
    !IS_PRODUCTION || DIMENSIONS[id][campo] === "published";
  const produtos = await listarProdutos();
  const aVenda = (id: string) => vendavel(produtos.find((p) => p.product_id === id));

  const fixas = ["", "/dimensoes", "/mapa", "/protocolo", "/mentoria", "/ju", "/ideias", "/contato",
    "/ideias/artigos", "/ideias/newsletter", "/ideias/videos", "/ideias/repertorio"];
  const legais = (["privacidade", "termos"] as const).filter((p) => legalPublicavel(p)).map((p) => `/${p}`);
  const dims = DIMENSION_IDS.filter((d) => pub(d, "page")).map((d) => `/dimensoes/${d}`);
  const comerciais = DIMENSION_IDS.flatMap((d) => [
    ...(aVenda(`kit_${d}`) ? [`/kit/${d}`] : []),
    ...(aVenda(`plan_${d}`) ? [`/plano/${d}`] : []),
  ]);
  const mapas = DIMENSION_IDS.filter((d) => pub(d, "map")).map((d) => `/mapas/${d}`);
  const ideias = (await listarConteudos({ limite: 500 })).map((c) => ({
    url: `${BASE}/ideias/${TIPO_ROTA[c.content_type]}/${c.slug}`,
    lastModified: c.published_at ? new Date(c.published_at) : undefined,
  }));

  return [
    ...[...fixas, ...legais, ...dims, ...comerciais, ...mapas].map((p) => ({ url: `${BASE}${p}` })),
    ...ideias,
  ];
}
