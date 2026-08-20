import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4444',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: "**"
      },
      {
        pathname: '/logo/**',
      },
      {
        pathname: '/api/thumbnail/**',
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;