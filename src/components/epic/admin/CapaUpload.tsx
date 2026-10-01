"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase-browser";

/**
 * Campo de capa: aceita URL colada ou envio de imagem. O arquivo vai direto
 * do navegador para o Storage com URL assinada (sem passar pelo Vercel).
 */
export default function CapaUpload({ nome, inicial }: { nome: string; inicial: string | null }) {
  const [url, setUrl] = useState(inicial ?? "");
  const [status, setStatus] = useState<string | null>(null);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setStatus("Envie uma imagem.");
    if (file.size > 5 * 1024 * 1024) return setStatus("Imagem acima de 5 MB. Reduza antes de enviar.");
    setStatus("Enviando...");
    try {
      const seguro = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const r = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: `ideias/${Date.now()}-${seguro}` }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? "Falha ao preparar o envio.");
      const { token, path, publicUrl } = await r.json();
      const { error } = await getBrowserClient().storage.from("assets").uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      setUrl(publicUrl);
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro no envio.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input name={nome} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full rounded border border-linha bg-papel px-3 py-2" />
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <label className="cursor-pointer rounded border border-grafite px-3 py-1.5 text-grafite">
          Enviar imagem
          <input type="file" accept="image/*" onChange={enviar} className="hidden" />
        </label>
        {status && <span className="text-mineral-escuro">{status}</span>}
      </div>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="max-h-40 rounded border border-linha object-cover" />
      )}
    </div>
  );
}
