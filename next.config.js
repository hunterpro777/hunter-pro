/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora los errores de tipo durante el build en Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de ESLint durante el build en Vercel
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;