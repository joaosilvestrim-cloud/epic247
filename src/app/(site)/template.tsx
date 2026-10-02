import { ViewTransition } from "react";

/**
 * Troca de página: o miolo sai curto e entra com calma; header e rodapé
 * ficam (moram no layout). O template remonta a cada navegação, então
 * enter e exit disparam aqui. Do Mapa para o resultado ("revelar-resultado"),
 * a página sobe em cortina. Sem suporte do navegador, troca direto.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "revelar-resultado": "resultado-entra", default: "pagina-entra" }}
      exit={{ "revelar-resultado": "resultado-sai", default: "pagina-sai" }}
      default="none"
    >
      <div className="pagina">{children}</div>
    </ViewTransition>
  );
}
