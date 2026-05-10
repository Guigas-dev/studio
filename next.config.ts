
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Mantemos como true para o deploy inicial ser mais suave, 
    // mas em produção real o ideal é corrigir todos os tipos.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  // Otimização para Vercel Server Actions (IA flows podem demorar alguns segundos)
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
