/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Links curtos para redes sociais. Redirecionam para a home com o utm,
  // então a origem é registrada igual ao link longo.
  async redirects() {
    return [
      {
        source: "/ig",
        destination: "/?utm_source=instagram&utm_medium=bio",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
