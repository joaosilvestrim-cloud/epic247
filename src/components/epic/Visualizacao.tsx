"use client";

import { useEffect, useRef } from "react";
import { rastrear } from "@/lib/epic/client/track";

/** Dispara um evento de visualização uma vez por montagem. */
export default function Visualizacao({ nome, dados = {} }: { nome: string; dados?: Record<string, unknown> }) {
  const feito = useRef(false);
  useEffect(() => {
    if (feito.current) return;
    feito.current = true;
    rastrear(nome, dados);
    // dados é estável por página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);
  return null;
}
