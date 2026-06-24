import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/analytics";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1c34",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://energia.epic247.com.br"),
  title: "EPIC247 · Módulo Energia",
  description:
    "Você sabe muito, planeja bem e mesmo assim não sai do lugar. Não é falta de disciplina. É falta de combustível. Descubra qual dos 5 Drenos está sugando sua energia.",
  openGraph: {
    title: "EPIC247 · Módulo Energia",
    description:
      "Descubra em 2 minutos qual dos 5 Drenos está sugando sua energia, e o que mudar primeiro.",
    type: "website",
    locale: "pt_BR",
    siteName: "EPIC247",
  },
  twitter: {
    card: "summary_large_image",
    title: "EPIC247 · Módulo Energia",
    description:
      "Descubra em 2 minutos qual dos 5 Drenos está sugando sua energia, e o que mudar primeiro.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
