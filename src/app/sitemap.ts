import type { MetadataRoute } from "next";
import { IS_PRODUCTION } from "@/lib/epic/content/copy";
import { DIMENSION_IDS, DIMENSIONS } from "@/lib/epic/dimensions";
import { listarConteudos, TIPO_ROTA } from "@/lib/epic/server/conteudo";

export const revalidate = 3600;

const BASE = "https://epic247.com.br";

/** Só páginas publicadas e indexáveis. Resultados pessoais nunca entram. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pub = (id: (typeof DIMENSION_IDS)[number], campo: "page" | "map") =>
    !IS_PRODUCTION || DIMENSIONS[id][campo] === "published";

  const fixas = ["", "/dimensoes", "/mapa", "/protocolo", "/mentoria", "/ju", "/ideias", "/contato", "/privacidade", "/termos",
    "/ideias/artigos", "/ideias/newsletter", "/ideias/videos", "/ideias/repertorio"];
  const dims = DIMENSION_IDS.filter((d) => pub(d, "page")).flatMap((d) => [`/dimensoes/${d}`, `/kit/${d}`, `/plano/${d}`]);
  const mapas = DIMENSION_IDS.filter((d) => pub(d, "map")).map((d) => `/mapas/${d}`);
  const ideias = (await listarConteudos({ limite: 500 })).map((c) => ({
    url: `${BASE}/ideias/${TIPO_ROTA[c.content_type]}/${c.slug}`,
    lastModified: c.published_at ? new Date(c.published_at) : undefined,
  }));

  return [
    ...[...fixas, ...dims, ...mapas].map((p) => ({ url: `${BASE}${p}` })),
    ...ideias,
  ];
}
