import { DIMENSION_IDS, DIMENSIONS, type DimensionId } from "@/lib/epic/dimensions";

// Objetos editoriais desenhados em CSS (Brand §11: "Produto: mais sóbrio e
// editorial"; "Protocolo: coleção editorial coesa, como uma série de
// livros"). Sem fotografia de produto até existir a oficial. Nada aqui
// promete conteúdo que o produto não tem: só nome, dimensão e número.

const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as React.CSSProperties;

/** Capa de livro: Manual (escura) ou Workbook (clara). */
export function CapaLivro({
  tipo,
  dimensao,
  className = "",
  style,
}: {
  tipo: "Manual" | "Workbook";
  dimensao: DimensionId;
  className?: string;
  style?: React.CSSProperties;
}) {
  const d = DIMENSIONS[dimensao];
  const escuro = tipo === "Manual";
  return (
    <div
      aria-hidden
      style={style}
      className={`relative flex aspect-[3/4] w-[10.5rem] flex-col justify-between overflow-hidden rounded-[2px_5px_5px_2px] p-4 shadow-[0_18px_30px_-18px_rgba(23,22,20,0.55)] sm:w-[12rem] ${
        escuro ? "bg-tinta text-papel" : "border border-linha bg-papel-claro text-grafite"
      } ${className}`}
    >
      {/* Lombada: um filete de sombra na esquerda, como papel dobrado. */}
      <span className={`absolute inset-y-0 left-0 w-2 ${escuro ? "bg-black/25" : "bg-grafite/[0.06]"}`} />
      <span className="flex items-center justify-between pl-1.5">
        <span className="text-[10px] font-extrabold tracking-tight">
          EPIC<span className="mx-[1px] font-light italic text-latao">/</span>247
        </span>
        <span className={`font-mono text-[10px] ${escuro ? "text-latao" : "text-latao-escuro"}`}>
          {String(d.order).padStart(2, "0")}
        </span>
      </span>
      <span className="pl-1.5">
        <span className="mb-3 block h-px w-8 bg-latao" />
        <span className={`block font-mono text-[10px] ${escuro ? "text-papel/60" : "text-mineral-escuro"}`}>{tipo}</span>
        <span className="mt-1 block font-display text-[1.35rem] leading-tight">{d.name}</span>
      </span>
    </div>
  );
}

/** Kit: Manual na frente, Workbook atrás, entrando em sequência. */
export function CapasKit({ dimensao }: { dimensao: DimensionId }) {
  // Rotação no invólucro, entrada na capa: as duas não disputam o transform.
  return (
    <div className="paralaxe relative h-[15.5rem] w-[18rem] sm:h-[17.5rem] sm:w-[21rem]" style={{ "--paralaxe": "26px" } as React.CSSProperties}>
      {/* Workbook atrás à esquerda, Manual na frente à direita: os dois títulos ficam à vista. */}
      <div className="absolute left-0 top-0 -rotate-[4deg] transition-transform duration-700 [transition-timing-function:var(--ease-saida)] hover:-rotate-[6deg]">
        <CapaLivro tipo="Workbook" dimensao={dimensao} className="entrada" style={atraso(250)} />
      </div>
      <div className="absolute bottom-0 right-0 rotate-[3deg] transition-transform duration-700 [transition-timing-function:var(--ease-saida)] hover:rotate-[1deg]">
        <CapaLivro tipo="Manual" dimensao={dimensao} className="entrada" style={atraso(80)} />
      </div>
    </div>
  );
}

/** Protocolo: as 10 lombadas na estante, na ordem do Protocolo. */
export function EstanteProtocolo() {
  const alturas = [96, 92, 100, 94, 98, 90, 97, 93, 99, 95];
  return (
    <div aria-label="Os 10 Manuais do Protocolo" className="paralaxe w-full max-w-[30rem]" style={{ "--paralaxe": "20px" } as React.CSSProperties}>
      <ol className="revelar-lista flex h-[17rem] items-end gap-[3px] sm:h-[19rem]">
        {DIMENSION_IDS.map((id, i) => (
          <li key={id} className="flex h-full min-w-0 max-w-[2.9rem] flex-1 items-end">
            {/* Entrada no li, "puxar da estante" no filho: transforms separados. */}
            <span
              className="flex w-full flex-col items-center justify-between rounded-[2px_2px_1px_1px] bg-tinta px-1 pb-3 pt-2.5 text-papel shadow-[inset_-2px_0_0_rgba(0,0,0,0.25)] transition-transform duration-500 [transition-timing-function:var(--ease-saida)] hover:-translate-y-2"
              style={{ height: `${alturas[i]}%` }}
            >
              <span className="font-mono text-[9px] text-latao">{String(i + 1).padStart(2, "0")}</span>
              <span className="rotate-180 font-display text-[0.92rem] tracking-wide [writing-mode:vertical-rl] sm:text-[1.02rem]">
                {DIMENSIONS[id].name}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="h-[3px] rounded-full bg-grafite/25" />
    </div>
  );
}

/** Mentoria: as vagas do ciclo, ocupadas preenchidas (escassez real, Produtos §3). */
export function VagasMentoria({ capacidade, ocupadas }: { capacidade: number; ocupadas: number }) {
  return (
    <div>
      <ol aria-label={`${ocupadas} de ${capacidade} vagas ocupadas`} className="flex gap-2">
        {Array.from({ length: capacidade }, (_, i) => {
          const ocupada = i < ocupadas;
          return (
            <li
              key={i}
              className={`entrada h-9 w-9 rounded-full border ${ocupada ? "border-grafite bg-grafite" : "border-latao bg-transparent"}`}
              style={atraso(200 + i * 90)}
            />
          );
        })}
      </ol>
    </div>
  );
}

/** Plano: os 7 dias como um caderno, um passo por dia. */
export function SeteDias({ dias }: { dias: string[] }) {
  return (
    <ol className="revelar-lista grid grid-cols-7 border-y border-linha">
      {dias.map((t, i) => (
        <li key={i} className="flex min-h-[7.5rem] flex-col justify-between border-l border-linha p-2.5 first:border-l-0 sm:p-3">
          <span className="font-mono text-[10px] text-latao-escuro">D{i + 1}</span>
          <span className="font-display text-[0.8rem] leading-tight text-grafite [hyphens:auto] sm:text-[0.95rem]">{t}</span>
        </li>
      ))}
    </ol>
  );
}
