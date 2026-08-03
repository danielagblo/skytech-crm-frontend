const apiOrigin = (process.env.SKYTECH_API_ORIGIN ?? 'https://skytech-crm-backend-production.up.railway.app').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};
export default nextConfig;
