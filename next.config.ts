import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.externals = [...config.externals, { '@prisma/client': '@prisma/client' }];
    if (isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '.prisma/client': '@prisma/client'
        },
      };
    }
    return config;
  },
};

export default nextConfig;