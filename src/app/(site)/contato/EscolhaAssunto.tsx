"use client";

import { CONTATO_PAGINA as C } from "@/lib/epic/content/contato";

/** Card de assunto: escolhe o assunto no formulário e leva a pessoa até ele. */
export default function EscolhaAssunto() {
  function escolher(assunto: string) {
    window.dispatchEvent(new CustomEvent("epic:assunto", { detail: assunto }));
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.querySelector<HTMLElement>("#formulario input[name=name]")?.focus({ preventScroll: true });
    }, 450);
  }
  return (
    <ul className="revelar-lista mt-12 grid gap-px overflow-hidden rounded-[var(--radius-epic)] border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-5">
      {C.escolha.cards.map((c) => (
        <li key={c.assunto} className="bg-papel">
          <button
            type="button"
            onClick={() => escolher(c.assunto)}
            className="group flex h-full w-full flex-col p-6 text-left transition-colors hover:bg-papel-claro"
          >
            <span className="font-display text-[1.2rem] leading-tight text-grafite">{c.titulo}</span>
            <span className="mt-3 flex-1 text-[14px] leading-relaxed text-mineral-escuro">{c.texto}</span>
            <span className="mt-5 flex items-center gap-2 text-[13px] font-medium text-grafite/85 group-hover:text-tinta">
              {c.cta}
              <span aria-hidden className="block h-px w-5 bg-latao transition-all duration-300 group-hover:w-9" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
