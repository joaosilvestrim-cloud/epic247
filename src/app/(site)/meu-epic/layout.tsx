import type { Metadata } from "next";

// Meu EPIC (CR-01A): área pessoal. Fora de busca, sem dado pessoal em título
// ou descrição, sem cache público (cabeçalhos no src/proxy.ts).
export const metadata: Metadata = {
  title: { default: "Meu EPIC", template: "%s · Meu EPIC" },
  robots: { index: false, follow: false, nocache: true },
};

export default function MeuEpicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
