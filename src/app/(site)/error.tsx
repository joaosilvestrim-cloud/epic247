"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MICRO } from "@/lib/epic/content/microcopy";

// 500 do site (Copy Final §27.29). Mensagem humana; o detalhe técnico fica no log.
export default function ErroSite({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const m = MICRO.erroServidor;
  return (
    <section className="grao min-h-[60vh]">
      <div className="mx-auto w-full max-w-3xl px-5 py-24 sm:px-8">
        <h1 className="font-display text-[2.6rem] leading-tight text-grafite">{m.titulo}</h1>
        <p className="mt-4 text-lg text-grafite/80">{m.texto}</p>
        <p className="mt-2 text-[15px] text-mineral-escuro">{MICRO.erro.persistente}</p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={reset}
            className="rounded-[var(--radius-epic)] bg-grafite px-6 py-3.5 text-[15px] font-semibold text-papel hover:bg-tinta"
          >
            {m.tentar}
          </button>
          <Link href="/" className="border-b border-latao pb-0.5 text-[15px] font-medium text-grafite">
            {MICRO.naoEncontrada.voltar}
          </Link>
        </div>
      </div>
    </section>
  );
}
