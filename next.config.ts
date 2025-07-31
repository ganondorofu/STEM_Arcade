import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/games/:path*',
        destination: `${backendUrl}/games/:path*`, 
      },
    ]
  },
};

export default nextConfig;
