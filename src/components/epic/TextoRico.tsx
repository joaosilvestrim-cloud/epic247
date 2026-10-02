import type { ReactNode } from "react";

/**
 * Markdown mínimo para o corpo dos conteúdos de Ideias: parágrafos, ## e ###,
 * listas com "- ", > citação, **negrito**, *itálico* e [link](https://...).
 * Monta elementos React: nenhum HTML vindo do banco é injetado na página.
 */
export default function TextoRico({ texto }: { texto: string }) {
  const blocos = texto.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-relaxed text-grafite/90">
      {blocos.map((b, i) => {
        if (b.startsWith("### ")) return <h3 key={i} className="pt-2 font-display text-2xl text-grafite">{inline(b.slice(4))}</h3>;
        if (b.startsWith("## ")) return <h2 key={i} className="pt-4 font-display text-[1.9rem] leading-tight text-grafite">{inline(b.slice(3))}</h2>;
        if (b.split("\n").every((l) => l.startsWith("- ")))
          return (
            <ul key={i} className="space-y-2 pl-5">
              {b.split("\n").map((l, j) => (
                <li key={j} className="list-disc marker:text-latao">{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        if (b.startsWith("> "))
          return (
            <blockquote key={i} className="traco-lateral pl-5 font-display text-2xl leading-snug text-grafite">
              {inline(b.replace(/^> ?/gm, ""))}
            </blockquote>
          );
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > ultimo) out.push(s.slice(ultimo, m.index));
    if (m[1]) out.push(<strong key={k++} className="font-semibold text-grafite">{m[1]}</strong>);
    else if (m[2]) out.push(<em key={k++}>{m[2]}</em>);
    else if (m[3])
      out.push(
        <a key={k++} href={m[4]} className="underline decoration-latao underline-offset-4" {...(m[4].startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[3]}
        </a>
      );
    ultimo = m.index + m[0].length;
  }
  if (ultimo < s.length) out.push(s.slice(ultimo));
  // Quebra de linha simples dentro do parágrafo vira <br>.
  const final: ReactNode[] = [];
  out.forEach((n, i) => {
    if (typeof n !== "string") {
      final.push(n);
      return;
    }
    n.split("\n").forEach((parte, j) => {
      if (j > 0) final.push(<br key={`br${i}-${j}`} />);
      final.push(parte);
    });
  });
  return final;
}
