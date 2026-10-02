import Link from "next/link";
import { DIMENSION_IDS, DIMENSIONS, type DimensionId } from "@/lib/epic/dimensions";
import { dimensaoHref } from "@/lib/epic/site";

/**
 * Onde esta dimensão fica no sistema: dez linhas na ordem do Protocolo, a
 * atual em latão. "10 dimensões, um sistema" visto de uma página só.
 * Anterior e próxima levam à página ou ao Mapa, o que estiver no ar.
 */
export default function PosicaoDimensao({ atual }: { atual: DimensionId }) {
  const i = DIMENSION_IDS.indexOf(atual);
  const vizinha = (k: number) => {
    const id = DIMENSION_IDS[(k + DIMENSION_IDS.length) % DIMENSION_IDS.length];
    return { id, nome: DIMENSIONS[id].name, href: dimensaoHref(id) };
  };
  const anterior = vizinha(i - 1);
  const proxima = vizinha(i + 1);

  return (
    <div className="w-full max-w-[20rem]">
      <p aria-hidden className="entrada-suave select-none font-display text-[7rem] font-light leading-none text-linha sm:text-[9rem]">
        {String(i + 1).padStart(2, "0")}
      </p>
      <ol aria-label="As 10 dimensões" className="mt-6 flex items-end gap-[7px]">
        {DIMENSION_IDS.map((id, k) => {
          const href = dimensaoHref(id);
          const esta = id === atual;
          const traco = (
            <span
              className={`sinal-linha block w-[2px] rounded-full ${esta ? "h-14 bg-latao" : "h-8 bg-mineral/45 group-hover:bg-grafite"}`}
              style={{ "--i": k } as React.CSSProperties}
            />
          );
          return (
            <li key={id} className="sinal-tempo">
              {href && !esta ? (
                <Link href={href} className="group block px-[3px] py-1" aria-label={DIMENSIONS[id].name}>
                  {traco}
                </Link>
              ) : (
                <span className="block px-[3px] py-1" aria-current={esta ? "page" : undefined} aria-label={DIMENSIONS[id].name}>
                  {traco}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex justify-between gap-4 text-sm text-mineral-escuro">
        {anterior.href ? (
          <Link href={anterior.href} className="hover:text-grafite">← {anterior.nome}</Link>
        ) : (
          <span />
        )}
        {proxima.href && (
          <Link href={proxima.href} className="hover:text-grafite">{proxima.nome} →</Link>
        )}
      </div>
    </div>
  );
}
