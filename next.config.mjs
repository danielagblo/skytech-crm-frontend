import { fileURLToPath } from "node:url";

const apiOrigin = (
  process.env.SKYTECH_API_ORIGIN ??
  "https://skytech-crm-backend.onrender.com"
).replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
};
export default nextConfig;
