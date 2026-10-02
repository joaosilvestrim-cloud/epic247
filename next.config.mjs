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
      // Rotas legadas de Mapa (Blueprint v1.2 §54.3 e §57): /diagnostico nunca
      // é URL pública. Redirect permanente para a rota canônica.
      { source: "/diagnostico", destination: "/mapa", permanent: true },
      { source: "/diagnostico/resultado/:token", destination: "/mapa/resultado/:token", permanent: true },
      { source: "/diagnostico/:dimensao", destination: "/mapas/:dimensao", permanent: true },
      { source: "/diagnostico/:dimensao/resultado/:token", destination: "/mapas/:dimensao/resultado/:token", permanent: true },
      { source: "/diagnosticos/:dimensao", destination: "/mapas/:dimensao", permanent: true },
      { source: "/mapa-de-friccao", destination: "/mapa", permanent: true },
    ];
  },
};

export default nextConfig;
