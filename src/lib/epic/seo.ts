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
