"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { registrarSessao } from "@/lib/epic/client/track";

/** Abre a sessão no primeiro carregamento. O /admin não conta como visita. */
export default function Rastreador() {
  const pathname = usePathname();
  const feito = useRef(false);
  useEffect(() => {
    if (feito.current || pathname.startsWith("/admin")) return;
    feito.current = true;
    void registrarSessao();
  }, [pathname]);
  return null;
}
