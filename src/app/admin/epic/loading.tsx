/** Resposta imediata ao trocar de página no admin, enquanto os números chegam. */
export default function Carregando() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="mb-8 h-9 w-64 rounded bg-linha/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-[var(--radius-epic)] border border-linha bg-papel-claro" />
        ))}
      </div>
      <div className="mt-8 h-72 rounded-[var(--radius-epic)] border border-linha bg-papel-claro" />
    </div>
  );
}
