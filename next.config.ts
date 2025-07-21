/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Esto ayuda a que la compilación pase a pesar de los warnings/errores de ESLint
  },
  // --- AÑADE ESTA LÍNEA CLAVE PARA OPTIMIZAR EL DESPLIEGUE EN SERVERLESS ---
  output: 'standalone', 
};

module.exports = nextConfig;