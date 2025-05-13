/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**'
      },
      {
        protocol: 'https',
        hostname: 'c67a-186-220-156-104.ngrok-free.app',
        port: '',
        pathname: '/uploads/avatars/**'
      },
      {
        protocol: 'https',
        hostname: 'agendamento-cabelereiros-production.up.railway.app',
        pathname: '/uploads/**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false
    }

    // Adiciona alias principal para resolver os módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.' // Mapeia @ para a raiz do diretório do frontend
    }

    return config
  },
  experimental: {
    esmExternals: 'loose'
  },
  swcMinify: true,
  // Ensure PostCSS processing works
  postcss: {
    // Use the existing postcss.config.js
  }
}

module.exports = nextConfig
