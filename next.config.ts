import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
