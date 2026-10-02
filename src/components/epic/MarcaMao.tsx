import type { ReactNode } from "react";

/**
 * Marcação feita à mão em latão (Brand §9: "sublinhados; círculos feitos à
 * mão... sinais de pensamento acontecendo, não decoração"). O traço se
 * desenha uma vez quando aparece; com movimento reduzido, já vem pronto.
 * Usar com parcimônia: uma por tela.
 */
export default function MarcaMao({
  children,
  tipo = "sublinhado",
  atraso = 700,
  rolagem = false,
}: {
  children: ReactNode;
  tipo?: "sublinhado" | "circulo";
  atraso?: number;
  /** Abaixo da dobra: desenha quando chega à tela (onde o navegador suporta). */
  rolagem?: boolean;
}) {
  const rola = rolagem ? " marca-rola" : "";
  const estilo = { "--atraso": `${atraso}ms` } as React.CSSProperties;
  if (tipo === "circulo") {
    return (
      <span className="relative mx-[0.22em] inline-block whitespace-nowrap">
        <span className="relative z-10">{children}</span>
        <svg
          aria-hidden
          className={`traco-mao${rola} pointer-events-none absolute -inset-x-[0.35em] -inset-y-[0.22em] h-[calc(100%+0.44em)] w-[calc(100%+0.7em)] overflow-visible`}
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          style={estilo}
        >
          <path
            pathLength={1}
            d="M24 12 C 70 2, 160 2, 188 18 C 204 30, 184 52, 120 56 C 58 60, 6 50, 8 30 C 10 16, 40 8, 92 6"
            fill="none"
            stroke="var(--color-latao)"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
    );
  }
  // Sublinhado: fundo em SVG que acompanha a quebra de linha (cada linha ganha o traço).
  return (
    <span className={`marca-mao marca-mao-anima${rola}`} style={estilo}>
      {children}
    </span>
  );
}
