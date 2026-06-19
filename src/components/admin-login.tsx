"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ configurado }: { configurado: boolean }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Falha ao entrar.");
      }
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-deep px-6 text-white">
      <div className="w-full max-w-sm rounded-3xl border border-gold/30 bg-white/[0.04] p-8 shadow-[0_0_80px_-24px] shadow-gold/40 backdrop-blur">
        <div className="text-center">
          <span className="text-3xl">⚡</span>
          <h1 className="mt-3 font-display text-2xl font-bold">EPIC247 · Admin</h1>
          <p className="mt-1 text-sm text-white/50">Painel administrativo</p>
        </div>

        {!configurado ? (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            Defina a variável <code className="text-white">ADMIN_PASSWORD</code> no
            servidor (Vercel / .env.local) para habilitar o login.
          </p>
        ) : (
          <form onSubmit={entrar} className="mt-6 space-y-3">
            <input
              type="password"
              required
              autoFocus
              placeholder="Senha de administrador"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-gold"
            />
            {erro && <p className="text-sm text-red-400">{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-gold px-6 py-3 font-bold text-navy-deep transition hover:brightness-110 disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
