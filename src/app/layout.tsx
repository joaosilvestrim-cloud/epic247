import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/analytics";
import OrigemTracker from "@/components/origem-tracker";
import { getTracking } from "@/lib/settings";

/**
 * As tags de rastreamento vem do banco (aba Marketing do /admin). Sem isto,
 * as paginas estaticas (quiz, obrigado, oto) congelariam o pixel no momento
 * do deploy e uma troca no painel so valeria no proximo build. Com ISR de
 * 60s, o que o marketing salvar entra no ar em ate um minuto.
 */
export const revalidate = 60;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1c34",
};

// Variavel, para o opsz da Fraunces funcionar: em tamanho grande o desenho
// fica mais delicado, em tamanho pequeno mais robusto.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://epic247.com.br"),
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // IDs de rastreamento vem do banco (aba Marketing do /admin), com a env
  // como fallback. Trocar um pixel nao exige deploy.
  const tracking = await getTracking();

  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Analytics tracking={tracking} />
        <OrigemTracker />
        {children}
      </body>
    </html>
  );
}
