"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-b border-latao pb-0.5 text-[15px] text-grafite hover:text-tinta"
    >
      Imprimir ou salvar em PDF
    </button>
  );
}
