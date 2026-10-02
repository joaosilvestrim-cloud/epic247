import type { Metadata } from "next";
import type { Product } from "./products";

// Dados estruturados (schema.org) das páginas indexáveis (Blueprint §26).

export const SITE = "https://epic247.com.br";

export const ORGANIZACAO = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EPIC247",
  url: SITE,
  logo: `${SITE}/icon.svg`,
  slogan: "Transformação pessoal aplicada",
};

export const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EPIC247",
  url: SITE,
  inLanguage: "pt-BR",
};

/** Produto com oferta só quando está à venda: nada de anunciar o que não dá para comprar. */
export function produtoLd(p: Product, caminho: string, descricao: string) {
  const aVenda = Boolean(p.active && p.checkout_url);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.product_name,
    description: descricao,
    brand: { "@type": "Brand", name: "EPIC247" },
    url: `${SITE}${caminho}`,
    ...(aVenda
      ? {
          offers: {
            "@type": "Offer",
            price: p.price_list.toFixed(2),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: `${SITE}${caminho}`,
          },
        }
      : {}),
  };
}

// ── Matriz SEO/OG/robots (Blueprint v1.2 §57) ──

/**
 * Metadata de página indexável. Fallbacks da matriz: og herda o seo,
 * twitter herda o og, canonical é a rota limpa (nunca com querystring).
 */
export function metadados({
  titulo,
  tituloAbsoluto = false,
  descricao,
  caminho,
  ogTitulo,
  ogDescricao,
  ogTipo = "website",
}: {
  titulo: string;
  tituloAbsoluto?: boolean;
  descricao: string;
  caminho: string;
  ogTitulo?: string;
  ogDescricao?: string;
  ogTipo?: "website" | "article" | "profile";
}): Metadata {
  const tituloSeo = tituloAbsoluto ? titulo : `${titulo} | EPIC247`;
  const og = { title: ogTitulo ?? tituloSeo, description: ogDescricao ?? descricao };
  return {
    title: tituloAbsoluto ? { absolute: titulo } : titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: { ...og, type: ogTipo, url: caminho, siteName: "EPIC247", locale: "pt_BR" },
    twitter: { card: "summary_large_image", ...og },
  };
}

/** Páginas pessoais, transacionais e de estado: fora da busca (§57.5, §57.17). */
export const NAO_INDEXAR: Metadata["robots"] = { index: false, follow: false };

export function webPageLd({ nome, descricao, caminho, tipo = "WebPage" }: { nome: string; descricao: string; caminho: string; tipo?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": tipo,
    name: nome,
    description: descricao,
    url: `${SITE}${caminho}`,
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: "EPIC247", url: SITE },
  };
}

/** Breadcrumb só onde a trilha existe de fato na navegação. */
export function breadcrumbLd(trilha: { nome: string; caminho: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trilha.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.nome, item: `${SITE}${t.caminho}` })),
  };
}
