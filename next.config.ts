
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
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
  // Configuração necessária para o ambiente de preview no Cloud Workstations
  // Resolve o aviso "Cross origin request detected"
  // @ts-ignore - allowedDevOrigins é suportado no Next 15 para domínios de desenvolvimento
  allowedDevOrigins: ['*.cloudworkstations.dev', 'localhost:9002'],
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*.cloudworkstations.dev', 'localhost:9002']
    },
  },
};

export default nextConfig;
