"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Encerra a sessão do admin e volta para a tela de senha. */
export default function BotaoSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  return (
    <button
      type="button"
      disabled={saindo}
      onClick={async () => {
        setSaindo(true);
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.refresh();
      }}
      className="hover:text-papel disabled:opacity-60"
    >
      {saindo ? "Saindo…" : "Sair"}
    </button>
  );
}
