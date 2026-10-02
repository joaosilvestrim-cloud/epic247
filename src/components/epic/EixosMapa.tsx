import { rotuloFaixa } from "@/lib/epic/maps/engine";
import type { AxisScore, Axis } from "@/lib/epic/maps/types";

/**
 * Leitura dos cinco eixos (RF-015): visual e textual. Nunca "nota de 0 a
 * 100" (Mapa de Energia §6). A faixa vem escrita, então a leitura não
 * depende de cor.
 */
export default function EixosMapa({
  eixos,
  rotulos,
  destaque,
  mapa,
}: {
  eixos: AxisScore[];
  rotulos: Axis[];
  destaque: string[];
  /** O rótulo da faixa mais alta muda por Mapa (Energia usa "ponto de atenção"). */
  mapa?: string;
}) {
  return (
    <ol className="divide-y divide-linha border-y border-linha">
      {eixos.map((e, idx) => {
        const nome = rotulos.find((r) => r.key === e.key)?.label ?? e.key;
        const principal = destaque.includes(e.key);
        return (
          <li
            key={e.key}
            className={`relative grid items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[11rem_1fr_11rem] ${
              principal ? "before:absolute before:-left-4 before:inset-y-3 before:w-[2px] before:bg-latao sm:before:-left-5" : ""
            }`}
          >
            <span className={`font-display text-lg ${principal ? "text-tinta" : "text-grafite/80"}`}>{nome}</span>
            <span aria-hidden className="relative h-2 overflow-hidden rounded-full bg-papel-escuro">
              <span
                className={`barra-cresce absolute inset-y-0 left-0 rounded-full ${principal ? "bg-grafite" : "bg-mineral"}`}
                style={{ width: `${Math.max(4, (e.score / 12) * 100)}%`, "--atraso": `${250 + idx * 110}ms` } as React.CSSProperties}
              />
            </span>
            <span className={`text-sm sm:text-right ${principal ? "font-semibold text-tinta" : "text-mineral-escuro"}`}>
              {/* Faixa pelo critério do documento; o destaque é escrito, não só cor. */}
              {principal && e.band !== "priority" ? `${rotuloFaixa(e.band, mapa)} · principal` : rotuloFaixa(e.band, mapa)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
