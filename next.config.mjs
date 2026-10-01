/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fotos e capas vêm do Storage do Supabase.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },

  async redirects() {
    return [
      // Links curtos para redes sociais. Redirecionam com o utm, então a
      // origem é registrada igual ao link longo.
      { source: "/ig", destination: "/?utm_source=instagram&utm_medium=bio", permanent: false },

      // Rotas do site do Ciclo 1 (antes do 2.0). Nenhum link já divulgado quebra.
      { source: "/quiz", destination: "/mapas/energia", permanent: false },
      { source: "/obrigado", destination: "/", permanent: false },
      { source: "/oto", destination: "/protocolo", permanent: false },
      // Variações de URL dos documentos (Site e Arquitetura usava /diagnostico).
      { source: "/diagnostico", destination: "/mapa", permanent: false },
      { source: "/diagnostico/:dimensao", destination: "/mapas/:dimensao", permanent: false },
      { source: "/mapa-de-friccao", destination: "/mapa", permanent: false },
    ];
  },
};

export default nextConfig;
