import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/analytics";
import Rastreador from "@/components/epic/Rastreador";
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
  themeColor: "#171614",
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

const STAGING = process.env.NEXT_PUBLIC_EPIC_ENV !== "production";

export const metadata: Metadata = {
  metadataBase: new URL("https://epic247.com.br"),
  title: {
    default: "EPIC247 · Transformação pessoal aplicada",
    template: "%s | EPIC247",
  },
  description:
    "Existe uma distância entre a vida que você vive e a vida que sabe que poderia viver. O EPIC247 ajuda você a encontrar o seu ponto de fricção e construir a infraestrutura para mudar de verdade.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "EPIC247",
    title: "EPIC247 · Da vida que acontece para a vida que você escolhe",
    description: "Descubra onde está o seu ponto de fricção hoje.",
  },
  twitter: { card: "summary_large_image" },
  // Staging e previews nunca entram no Google (RF-089).
  robots: STAGING ? { index: false, follow: false } : { index: true, follow: true },
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
        <Rastreador />
        {children}
      </body>
    </html>
  );
}
