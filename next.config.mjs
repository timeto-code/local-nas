/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.3.7',
        port: '8080',
        pathname: '/static/**',
      },
    ],
  },
};

export default nextConfig;
