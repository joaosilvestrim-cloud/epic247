// Catálogo de produtos (Produtos e Pricing v1.0 + Modelo de Dados §12).
// Preço vive SÓ aqui (RF-074). Produto sem checkout configurado fica
// inativo e não aparece como comprável (RF-073).

import { DIMENSIONS, DIMENSION_IDS, type DimensionId } from "./dimensions";

export type ProductType = "plan" | "kit" | "protocol" | "mentoring";

export interface Product {
  product_id: string;
  product_type: ProductType;
  /** null para Protocolo e Mentoria, que são gerais. */
  product_dimension: DimensionId | null;
  product_name: string;
  /** Em reais. */
  price_list: number;
  /** URL do checkout (Kiwify). Sem URL, o produto não é vendável. */
  checkout_url: string | null;
  active: boolean;
  /**
   * Quem entrega (CR-01): "epic" = Meu EPIC; "kiwify" = área da Kiwify, só na
   * transição do Kit Energia do Ciclo 1. Ausente = catálogo do código.
   */
  delivery?: "epic" | "kiwify";
  /** Kit/Protocolo: materiais publicados no Meu EPIC (Kit: da dimensão; Protocolo: das 10). */
  materiais_ok?: boolean;
}

/** Checkout já existente: o "Módulo Energia R$97" do site atual é o Kit Energia. */
const CHECKOUT_KIT_ENERGIA = "https://pay.kiwify.com.br/vJBeZ8S";

export const PRICES = {
  plan: 29,
  kit: 97,
  protocol: 497,
  mentoring: 1997,
} as const satisfies Record<ProductType, number>;

/** Mentoria piloto (Produtos §3): acima disso o CTA vira lista de espera. */
export const MENTORING_CAPACITY = 5;

function produto(
  tipo: "plan" | "kit",
  d: DimensionId,
  checkout: string | null = null
): Product {
  const nome = DIMENSIONS[d].name;
  return {
    product_id: `${tipo}_${d}`,
    product_type: tipo,
    product_dimension: d,
    product_name: tipo === "plan" ? `Plano EPIC ${nome} 7 Dias` : `Kit EPIC ${nome}`,
    price_list: PRICES[tipo],
    checkout_url: checkout,
    active: checkout !== null,
  };
}

export const PRODUCTS: Product[] = [
  ...DIMENSION_IDS.map((d) => produto("plan", d)),
  ...DIMENSION_IDS.map((d) => produto("kit", d, d === "energia" ? CHECKOUT_KIT_ENERGIA : null)),
  {
    product_id: "protocol",
    product_type: "protocol",
    product_dimension: null,
    product_name: "Protocolo EPIC247",
    price_list: PRICES.protocol,
    checkout_url: null,
    active: false,
  },
  {
    product_id: "mentoring",
    product_type: "mentoring",
    product_dimension: null,
    product_name: "Mentoria EPIC Individual",
    price_list: PRICES.mentoring,
    checkout_url: null,
    active: false,
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.product_id === id);
}

export const planOf = (d: DimensionId) => getProduct(`plan_${d}`)!;
export const kitOf = (d: DimensionId) => getProduct(`kit_${d}`)!;

export function formatPrice(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
