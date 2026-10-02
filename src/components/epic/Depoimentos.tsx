import { DEPOIMENTOS, type LugarDepoimento } from "@/lib/epic/content/depoimentos";

/**
 * TestimonialBlock "futuro-ready" (Blueprint §7). Não aparece enquanto não
 * houver depoimento real, autorizado e cadastrado em content/depoimentos.ts.
 * Nada de depoimento inventado (Funis §33: sem manipulação).
 */
export default function Depoimentos({ lugar }: { lugar: LugarDepoimento }) {
  const itens = DEPOIMENTOS.filter((d) => d.lugares.includes(lugar) && d.autorizado);
  if (!itens.length) return null;
  return (
    <section className="border-t border-linha">
      <div className="mx-auto grid max-w-[76rem] gap-10 px-5 py-20 sm:px-8 md:grid-cols-2">
        {itens.map((d) => (
          <figure key={d.texto} className="border-l border-latao pl-6">
            <blockquote className="font-display text-xl leading-snug text-grafite">“{d.texto}”</blockquote>
            <figcaption className="mt-4 text-sm text-mineral-escuro">
              {d.nome}
              {d.contexto ? ` · ${d.contexto}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
