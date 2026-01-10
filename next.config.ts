import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3002',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'myswanand.com',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
