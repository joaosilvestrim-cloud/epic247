"use client";

import { useState } from "react";
import { enviar, espelhar } from "@/lib/epic/client/track";

/**
 * Abre o checkout pelo servidor (que registra StartCheckout, bloqueia recompra
 * e monta o link com rastreio) e espelha InitiateCheckout no Pixel com o
 * mesmo event_id.
 */
export default function BotaoCheckout({
  productId,
  token,
  rotulo,
  escuro = false,
  disponivel = true,
}: {
  productId: string;
  token?: string | null;
  rotulo: string;
  escuro?: boolean;
  disponivel?: boolean;
}) {
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function ir() {
    setErro(null);
    setIndo(true);
    try {
      const d = await enviar<{ url: string; event_id: string; value: number }>("/api/v2/checkout/iniciar", {
        product_id: productId,
        r: token ?? null,
      });
      espelhar("StartCheckout", d.event_id, { value: d.value, currency: "BRL", product_id: productId });
      window.location.href = d.url;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível abrir o checkout.");
      setIndo(false);
    }
  }

  const cores = escuro ? "bg-papel text-tinta hover:bg-papel-claro" : "bg-grafite text-papel hover:bg-tinta";
  return (
    <div>
      <button
        type="button"
        onClick={ir}
        disabled={indo || !disponivel}
        className={`group inline-flex items-center gap-3 rounded-[var(--radius-epic)] px-7 py-4 text-[15px] font-semibold transition-colors disabled:opacity-50 ${cores}`}
      >
        {!disponivel ? "Em breve" : indo ? "Abrindo o checkout..." : rotulo}
        {disponivel && <span aria-hidden className="h-px w-5 bg-latao transition-all group-hover:w-8" />}
      </button>
      {erro && (
        <p role="alert" className={`mt-3 text-sm ${escuro ? "text-[#e8b4a0]" : "text-[#9a3b2a]"}`}>
          {erro}
        </p>
      )}
    </div>
  );
}
