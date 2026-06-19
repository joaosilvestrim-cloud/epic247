"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ObrigadoPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-16 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-gold opacity-30" />
      <div className="absolute left-1/2 top-1/3 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px] animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gold/15 text-5xl"
        >
          ✓
        </motion.div>

        <h1 className="font-display text-3xl font-black sm:text-4xl">
          Compra confirmada!
        </h1>
        <p className="mt-4 text-lg text-white/70">
          Bem-vindo ao <strong className="text-white">Módulo Energia</strong>. Seu
          acesso foi enviado para o e-mail cadastrado no checkout.
        </p>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-white/[0.04] p-6 text-left backdrop-blur">
          <h2 className="font-display text-lg font-bold">Próximos passos</h2>
          <ol className="mt-3 space-y-2 text-white/80">
            <li>1. Verifique seu e-mail (e a caixa de spam) com o acesso.</li>
            <li>2. Faça o login na plataforma e complete o onboarding rápido.</li>
            <li>3. Faça seu primeiro check-in e veja sua Bateria Vital.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-bold text-navy-deep shadow-lg transition hover:brightness-110"
          >
            Acessar a plataforma
          </a>
          <Link
            href="/oto"
            className="text-sm font-medium text-gold-soft underline-offset-4 transition hover:underline"
          >
            Antes de entrar, veja uma oferta especial →
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
