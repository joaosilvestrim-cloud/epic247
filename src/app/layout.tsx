import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPIC247 — Módulo Energia",
  description:
    "Você sabe muito, planeja bem e mesmo assim não sai do lugar. Não é falta de disciplina. É falta de combustível. Descubra qual dos 5 Drenos está sugando sua energia.",
  openGraph: {
    title: "EPIC247 — Módulo Energia",
    description:
      "Descubra em 2 minutos qual dos 5 Drenos está sugando sua energia — e o que mudar primeiro.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
