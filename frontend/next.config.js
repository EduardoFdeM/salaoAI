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
      }
    ]
  }
}

module.exports = nextConfig
