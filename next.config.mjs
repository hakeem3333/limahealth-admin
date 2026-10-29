// Where the LimaHealth backend lives. In production set BACKEND_URL to the
// deployed API (e.g. https://limahealth-api.onrender.com) and
// NEXT_PUBLIC_API_BASE_URL to "/api/v1", so the browser only ever talks to this
// site's own origin and the backend's auth cookies (SameSite=Strict, some
// scoped to /api/v1/auth) are set on the admin domain where middleware.js
// reads them.
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
