/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 정적 export (Vercel 사용 이력 — 2026-08 Pages로 전환)
  // Pages용: basePath '/aetheria' / Vercel용: basePath '/' (root context)
  // 환경변수로 분기 (P34 패턴)
  basePath: process.env.VERCEL ? '' : '/aetheria',
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
