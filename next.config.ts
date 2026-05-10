
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
  // Configuração necessária para rodar em ambientes de workstation na nuvem (Firebase Studio)
  // Permite conexões de desenvolvimento do Cloud Workstations
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*.cloudworkstations.dev', 'localhost:9002']
    },
  },
};

export default nextConfig;
