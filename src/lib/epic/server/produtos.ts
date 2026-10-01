import "server-only";
import { PRODUCTS, type Product } from "../products";
import { query } from "./db";

// Produtos vêm do banco (preço, checkout e ativação editáveis no /admin).
// Se o banco estiver fora, cai no catálogo do código, sem quebrar a página.

export async function listarProdutos(): Promise<Product[]> {
  try {
    const rows = await query<Product & { price_list: string }>(
      `select product_id, product_type, product_dimension, product_name, price_list, checkout_url, active
       from products`
    );
    if (!rows.length) return PRODUCTS;
    return rows.map((r) => ({ ...r, price_list: Number(r.price_list) }));
  } catch {
    return PRODUCTS;
  }
}

export async function produto(id: string): Promise<Product | null> {
  return (await listarProdutos()).find((p) => p.product_id === id) ?? null;
}

/** Vendável = ativo e com checkout configurado (RF-073). */
export const vendavel = (p: Product | null | undefined): p is Product =>
  Boolean(p && p.active && p.checkout_url);

export async function capacidadeMentoria(): Promise<{ capacidade: number; ocupadas: number; disponivel: boolean }> {
  try {
    const [cfg] = await query<{ value: number }>("select value from app_settings where key = 'mentoring_capacity'");
    const capacidade = Number(cfg?.value ?? 5);
    const [{ n }] = await query<{ n: string }>(
      `select count(distinct t.lead_id)::text as n from transactions t
       join products p using (product_id)
       where p.product_type = 'mentoring' and t.transaction_status = 'approved'`
    );
    const ocupadas = Number(n);
    return { capacidade, ocupadas, disponivel: ocupadas < capacidade };
  } catch {
    return { capacidade: 5, ocupadas: 0, disponivel: true };
  }
}
