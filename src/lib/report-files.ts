import { DRENOS, type DrenoId } from "./drenos";

// PDFs finais diagramados, hospedados no Supabase Storage (bucket público
// `assets`, pasta `relatorios/<drenoId>.pdf`). Substituem o PDF gerado em runtime.

export function getReportPdfUrl(id: DrenoId): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/assets/relatorios/${id}.pdf`;
}

/** Nome amigável do arquivo no anexo, ex.: EPIC247-Relatorio-Sono-Quebrado.pdf */
export function getReportFileName(id: DrenoId): string {
  const slug = DRENOS[id].nome
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/\s+/g, "-");
  return `EPIC247-Relatorio-${slug}.pdf`;
}
