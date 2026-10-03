import type { Material } from "@/lib/epic/server/acessos";

const TIPO: Record<Material["asset_kind"], string> = {
  manual: "Manual",
  workbook: "Workbook",
  ferramenta: "Ferramenta",
  outro: "Material",
};

function tamanho(b: number | null) {
  if (!b) return "";
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

/** Lista de materiais com download protegido (cada clique confere o acesso). */
export default function Materiais({ itens }: { itens: Material[] }) {
  return (
    <ul>
      {itens.map((m) => (
        <li key={m.asset_id} className="border-b border-linha last:border-b-0">
          <a
            href={`/meu-epic/materiais/${m.asset_id}`}
            className="grid gap-1 py-5 hover:bg-papel-claro/60 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6"
          >
            <span>
              <span className="block font-mono text-xs text-latao-escuro">{TIPO[m.asset_kind]}</span>
              <span className="mt-1 block font-display text-[1.2rem] leading-snug text-grafite">{m.title}</span>
              <span className="mt-1 block text-sm text-mineral-escuro">
                {(m.file_name.split(".").pop() ?? "").toUpperCase()}
                {m.file_size ? ` · ${tamanho(m.file_size)}` : ""}
                {m.version > 1 ? ` · versão ${m.version}` : ""}
              </span>
            </span>
            <span className="link-traco mt-2 justify-self-start text-[15px] font-medium text-grafite sm:mt-0">
              Baixar<span className="sr-only"> {m.title}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
