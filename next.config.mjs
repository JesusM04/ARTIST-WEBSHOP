/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones de rendimiento
  swcMinify: true, // Usar SWC para minificación (más rápido que Terser)
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Eliminar console.logs en producción
    styledComponents: true, // Optimizar styled-components si se usan
  },
  
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Formatos modernos para imágenes
    formats: ['image/avif', 'image/webp'],
    // Calidad óptima para imágenes
    quality: 80,
    // Desactivar el redimensionamiento en tiempo de construcción (más rápido)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimización de construcción
  experimental: {
    // Optimizaciones experimentales
    scrollRestoration: true, // Mejorar la restauración de scroll
    optimizeCss: true, // Optimizar CSS
    turbo: true, // Usar Turbopack cuando esté disponible
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
      'react-icons',
    ], // Optimizar importaciones de paquetes grandes
  },
  
  // Compresión de activos estáticos
  compress: true,
  
  // Optimización de webpack
  webpack: (config, { dev, isServer }) => {
    // Fallbacks para módulos de Node
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Optimizaciones adicionales solo para producción
    if (!dev) {
      // Agregar optimizaciones adicionales
      config.optimization = {
        ...config.optimization,
        // Optimizar nombres de módulos
        moduleIds: 'deterministic',
        // Optimizar nombres de chunks
        chunkIds: 'deterministic',
        // Dividir chunks
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Obtener el nombre del paquete
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                
                // Devolver un nombre de chunk para npm
                return `npm.${packageName.replace('@', '')}`;
              },
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Optimización de generación de páginas estáticas
  output: 'standalone', // Optimización para despliegues
  
  // Configuraciones de rendimiento
  poweredByHeader: false, // Eliminar cabecera X-Powered-By por seguridad
  
  // Configuraciones de cache
  generateEtags: true,
}

export default nextConfig;
