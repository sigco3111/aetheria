/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 정적 export (Vercel 사용 이력 — 2026-08 Pages로 전환)
  output: 'export',
  basePath: '/aetheria',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
