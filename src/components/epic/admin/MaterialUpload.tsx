"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registrarMaterial } from "@/app/admin/epic/acessos-actions";
import { getBrowserClient } from "@/lib/supabase-browser";

const DIMS: { id: string; nome: string }[] = [
  { id: "energia", nome: "Energia" }, { id: "mentalidade", nome: "Mentalidade" },
  { id: "autoconhecimento", nome: "Autoconhecimento" }, { id: "felicidade", nome: "Felicidade" },
  { id: "planejamento", nome: "Planejamento" }, { id: "coragem", nome: "Coragem" }, { id: "acao", nome: "Ação" },
  { id: "inteligencia", nome: "Inteligência" }, { id: "excelencia", nome: "Excelência" }, { id: "amor", nome: "Amor" },
];

/**
 * Envio de material pago (Manual, Workbook, ferramenta). O arquivo vai do
 * navegador direto para o bucket privado com URL assinada; depois o registro
 * entra no banco. Nada fica com endereço público.
 */
export default function MaterialUpload() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const file = f.get("arquivo") as File | null;
    const titulo = String(f.get("title") ?? "").trim();
    if (!file || !file.size) return setStatus("Escolha o arquivo.");
    if (!titulo) return setStatus("Dê um título ao material.");
    if (file.size > 150 * 1024 * 1024) return setStatus("Arquivo acima de 150 MB.");
    setEnviando(true);
    setStatus("Enviando...");
    try {
      const produto = String(f.get("product_type"));
      const dimensao = String(f.get("dimension"));
      const r = await fetch("/api/admin/material-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_type: produto, dimension: dimensao, file_name: file.name }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "Falha ao preparar o envio.");
      const { bucket, path, token } = await r.json();
      const { error } = await getBrowserClient().storage.from(bucket).uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      const reg = await registrarMaterial({
        product_type: produto, dimension: dimensao, asset_kind: String(f.get("asset_kind")), title: titulo,
        storage_path: path, file_name: file.name, file_size: file.size, published: f.get("published") === "on",
      });
      if (!reg.ok) throw new Error(reg.erro ?? "Falha ao registrar.");
      (e.target as HTMLFormElement).reset();
      setStatus("Material enviado.");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro no envio.");
    } finally {
      setEnviando(false);
    }
  }

  const campo = "w-full rounded border border-linha bg-papel px-3 py-2 text-sm";
  return (
    <form onSubmit={enviar} className="grid gap-3 rounded border border-linha bg-papel-claro p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <label className="space-y-1">
        <span className="block text-mineral-escuro">Produto</span>
        <select name="product_type" className={campo} defaultValue="kit">
          <option value="kit">Kit (abre com o Kit da dimensão ou o Protocolo)</option>
          <option value="protocol">Protocolo (só para quem tem o Protocolo)</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-mineral-escuro">Dimensão</span>
        <select name="dimension" className={campo}>
          {DIMS.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-mineral-escuro">Tipo</span>
        <select name="asset_kind" className={campo}>
          <option value="manual">Manual</option>
          <option value="workbook">Workbook</option>
          <option value="ferramenta">Ferramenta</option>
          <option value="outro">Outro</option>
        </select>
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="block text-mineral-escuro">Título que a pessoa vê</span>
        <input name="title" className={campo} placeholder="Manual de Energia" />
      </label>
      <label className="space-y-1">
        <span className="block text-mineral-escuro">Arquivo</span>
        <input name="arquivo" type="file" accept=".pdf,.zip,.xlsx,.docx,.png,.jpg" className="block w-full text-sm" />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked /> Publicar agora
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={enviando} className="rounded bg-grafite px-4 py-2 text-papel disabled:opacity-60">
          Enviar material
        </button>
        {status && <span className="text-mineral-escuro" role="status">{status}</span>}
      </div>
    </form>
  );
}
