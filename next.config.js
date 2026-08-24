/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:44300/api') + '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
