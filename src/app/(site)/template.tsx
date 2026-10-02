/**
 * Troca de página: o miolo entra com um fade curto; header e rodapé ficam
 * (eles moram no layout). Sem movimento se a pessoa pediu menos movimento.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="pagina">{children}</div>;
}
