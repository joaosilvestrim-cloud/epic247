"use client";

import { useEffect } from "react";

export default function AdminEpicErro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[2rem] leading-tight text-grafite">Algo falhou</h1>
      <p className="mt-2 text-sm text-mineral-escuro">
        A operação não terminou. Recarregue a página para ver o estado atual antes de repetir.
        {error.digest && <> Código para o suporte: <code className="font-mono">{error.digest}</code>.</>}
      </p>
      <button onClick={reset} className="mt-4 rounded bg-grafite px-4 py-2 text-sm text-papel">Tentar de novo</button>
    </div>
  );
}
