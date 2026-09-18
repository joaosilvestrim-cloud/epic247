"use client";

import { useEffect } from "react";
import { capturarOrigem, registrarEvento } from "@/lib/origem";

const FLAG_SESSAO = "epic_visita_registrada";

/**
 * Captura a origem da visita (utm, referrer) e registra 1 visita por sessão
 * do navegador. Não renderiza nada.
 */
export default function OrigemTracker() {
  useEffect(() => {
    // O /admin é uso interno: não conta como visita.
    if (window.location.pathname.startsWith("/admin")) return;

    capturarOrigem();

    try {
      if (sessionStorage.getItem(FLAG_SESSAO)) return;
      sessionStorage.setItem(FLAG_SESSAO, "1");
    } catch {
      /* aba anônima com storage bloqueado: registra mesmo assim */
    }
    registrarEvento("visita");
  }, []);

  return null;
}
