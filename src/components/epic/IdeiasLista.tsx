import Link from "next/link";
import { DIMENSIONS, isDimensionId } from "@/lib/epic/dimensions";
import { IS_PRODUCTION } from "@/lib/epic/content/copy";
import { TIPO_LABEL, TIPO_ROTA, type ItemConteudo } from "@/lib/epic/server/conteudo";

/** Lista editorial de Ideias. Sem conteúdo: some em produção (RF-072). */
export default function IdeiasLista({ itens, escuro = false }: { itens: ItemConteudo[]; escuro?: boolean }) {
  if (itens.length === 0) {
    if (IS_PRODUCTION) return null;
    return (
      <p className={`font-mono text-sm ${escuro ? "text-papel/50" : "text-mineral-escuro"}`}>
        Nenhum conteúdo publicado ainda. Publique pelo /admin, aba Ideias.
      </p>
    );
  }
  return (
    <ul className={`divide-y ${escuro ? "divide-papel/10" : "divide-linha"} border-y ${escuro ? "border-papel/10" : "border-linha"}`}>
      {itens.map((c) => (
        <li key={c.id}>
          <Link
            href={`/ideias/${TIPO_ROTA[c.content_type]}/${c.slug}`}
            className="group grid gap-2 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8"
          >
            <span className={`font-mono text-xs ${escuro ? "text-latao" : "text-latao-escuro"}`}>
              {TIPO_LABEL[c.content_type]}
              {c.dimension && isDimensionId(c.dimension) ? ` · ${DIMENSIONS[c.dimension].name}` : ""}
            </span>
            <span>
              <span className={`block font-display text-xl leading-snug ${escuro ? "text-papel" : "text-grafite"} group-hover:underline group-hover:decoration-latao group-hover:underline-offset-4`}>
                {c.title}
              </span>
              {c.excerpt && (
                <span className={`mt-1 block text-[15px] ${escuro ? "text-papel/65" : "text-mineral-escuro"}`}>
                  {c.excerpt}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
