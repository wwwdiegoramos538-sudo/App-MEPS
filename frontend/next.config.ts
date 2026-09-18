import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    webpackMemoryOptimizations: true,
  },
  async rewrites() {
    // Health y network-url son rutas propias. El resto de /api se proxea en
    // app/api/[...path] a runtime (BACKEND_URL de Render no se congela en el build).
    return [];
  },
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
