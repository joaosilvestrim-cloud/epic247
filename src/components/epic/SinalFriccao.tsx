/**
 * Assinatura visual do Mapa de Fricção: dez linhas finas, uma por dimensão,
 * na ordem do Protocolo. Uma delas se destaca: o ponto de fricção. As linhas
 * crescem quando a seção entra na tela (CSS, sem JavaScript); sem suporte ou
 * com movimento reduzido, aparecem prontas. Puramente ilustrativo: não
 * representa o resultado de ninguém.
 */
const ALTURAS = [46, 62, 38, 54, 70, 96, 58, 42, 50, 34];
const DESTAQUE = 5;

export default function SinalFriccao({ escuro = true, tempo = false }: { escuro?: boolean; tempo?: boolean }) {
  return (
    <figure aria-hidden className={`sinal-friccao w-full max-w-[22rem] ${tempo ? "sinal-tempo" : ""}`}>
      <svg viewBox="0 0 220 110" className="h-auto w-full overflow-visible">
        {ALTURAS.map((h, i) => {
          const x = 11 + i * 22;
          const destaque = i === DESTAQUE;
          return (
            <g key={i} className="sinal-linha" style={{ "--i": i } as React.CSSProperties}>
              <line
                x1={x}
                x2={x}
                y1={100}
                y2={100 - h}
                stroke={destaque ? "var(--color-latao)" : escuro ? "rgba(241,232,220,0.35)" : "var(--color-mineral)"}
                strokeWidth={destaque ? 2.4 : 1.4}
                strokeLinecap="round"
              />
              {destaque && <circle cx={x} cy={100 - h - 6} r={2.6} fill="var(--color-latao)" className="sinal-ponto" />}
            </g>
          );
        })}
        <line x1="0" x2="220" y1="104" y2="104" stroke={escuro ? "rgba(241,232,220,0.18)" : "var(--color-linha)"} strokeWidth={1} />
      </svg>
    </figure>
  );
}
