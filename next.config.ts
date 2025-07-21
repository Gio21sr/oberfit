/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  
  // --- CONFIGURACIONES CLAVE PARA PRISMA EN VERCEL ---
  webpack: (config, { isServer }) => {
    // Evita que Webpack bundlee @prisma/client
    config.externals = [...config.externals, { '@prisma/client': '@prisma/client' }];
    
    // Solo en el lado del servidor (necesario para Prisma)
    if (isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          // Asegura que Prisma use el motor correcto
          '.prisma/client': '@prisma/client'
        },
      };
    }
    
    return config;
  },
  
  // Opcional: Habilita logs detallados en producción
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;