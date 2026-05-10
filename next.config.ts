
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
  // Configuração para permitir HMR e conexões seguras no Cloud Workstations (Next.js 15)
  // @ts-ignore
  allowedDevOrigins: ['*.cloudworkstations.dev', 'localhost:9002'],
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*.cloudworkstations.dev', 'localhost:9002']
    },
  },
};

export default nextConfig;
