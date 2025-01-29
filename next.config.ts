import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/public/:path*',
      },
    ];
  },
};

export default nextConfig;
