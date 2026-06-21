"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { trackInitiateCheckout } from "@/lib/analytics";

const DURACAO_MS = 30 * 60 * 1000; // 30 minutos
const STORAGE_KEY = "epic_oto_start";

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function OtoPage() {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    // Timer real: persiste o início no localStorage para não resetar no refresh.
    let inicio = Number(localStorage.getItem(STORAGE_KEY));
    if (!inicio || Number.isNaN(inicio)) {
      inicio = Date.now();
      localStorage.setItem(STORAGE_KEY, String(inicio));
    }
    const tick = () => setRestante(DURACAO_MS - (Date.now() - inicio));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const expirado = restante !== null && restante <= 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-deep px-6 py-14 text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-gold opacity-30" />
      <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px] animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-xl text-center"
      >
        <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">
          Oferta única · só nesta página
        </span>

        <h1 className="mt-6 text-balance font-display text-3xl font-black leading-tight sm:text-4xl">
          Acelere seus resultados com o Protocolo EPIC247 completo
        </h1>
        <p className="mt-4 text-white/70">
          Você acabou de garantir a base. Agora destrave os próximos módulos,
          Mentalidade, Planejamento e mais, em uma única condição especial que{" "}
          <strong className="text-white">não se repete</strong>.
        </p>

        {/* Timer */}
        {!expirado ? (
          <div className="mt-8 inline-flex flex-col items-center rounded-2xl border border-gold/30 bg-white/[0.04] px-8 py-5 backdrop-blur">
            <span className="text-xs uppercase tracking-widest text-white/50">
              Esta oferta expira em
            </span>
            <span className="mt-1 font-display text-5xl font-black tabular-nums text-gold">
              {restante === null ? "30:00" : fmt(restante)}
            </span>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/10 px-8 py-5">
            <p className="font-semibold text-red-200">Esta oferta expirou.</p>
            <Link
              href="/obrigado"
              className="mt-2 inline-block text-sm text-gold-soft underline-offset-4 hover:underline"
            >
              Voltar e acessar minha plataforma →
            </Link>
          </div>
        )}

        {/* Oferta */}
        {!expirado && (
          <div className="mt-8 rounded-3xl border border-gold/30 bg-white/[0.04] p-8 shadow-[0_0_80px_-24px] shadow-gold/40 backdrop-blur">
            <h2 className="font-display text-2xl font-bold">Protocolo EPIC247</h2>
            <p className="mt-2 text-white/60 line-through">De R$497</p>
            <p className="mt-1 font-display text-6xl font-black text-gold-gradient">
              R$270
            </p>
            <p className="mt-2 text-sm text-white/60">pagamento único · só agora</p>

            <a
              href="#checkout-oto"
              onClick={() => trackInitiateCheckout({ value: 270, currency: "BRL" })}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-bold text-navy-deep shadow-lg transition hover:brightness-110"
            >
              SIM, QUERO O PROTOCOLO · R$270
            </a>
            <p className="mt-4 text-xs text-white/40">
              Garantia de 14 dias também se aplica a esta oferta.
            </p>
          </div>
        )}

        <Link
          href="/obrigado"
          className="mt-6 inline-block text-sm text-white/40 underline-offset-4 transition hover:text-white hover:underline"
        >
          Não, obrigado, prefiro seguir só com o Módulo Energia
        </Link>
      </motion.div>
    </main>
  );
}
