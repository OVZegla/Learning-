/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Electron packaging sets NEXT_STANDALONE=1 so server.js is emitted.
  // Regular `next start` (used by start.bat/start.command) must NOT set it.
  output: process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined,
  async rewrites() {
    const api = process.env.API_INTERNAL_URL || "http://127.0.0.1:4000";
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
};
module.exports = nextConfig;
