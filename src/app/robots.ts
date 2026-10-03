import type { MetadataRoute } from "next";
import { IS_PRODUCTION } from "@/lib/epic/content/copy";

/** Staging nunca é indexado. Produção bloqueia admin, API e resultados pessoais. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/mapa/resultado/", "/mapas/*/resultado/", "/plano/acesso/", "/descadastro", "/meu-epic", "/compra/"],
      },
    ],
    sitemap: "https://epic247.com.br/sitemap.xml",
  };
}
