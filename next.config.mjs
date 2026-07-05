/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // {
      //   // This will now catch /auth/me, /auth/logout, and /auth/refresh-token
      //   source: "/auth/:path*",
      //   destination: "http://localhost:3000/api/v1/auth/:path*",
      // },
      // {
      //   // Add this to handle your general data APIs
      //   source: "/api/:path*",
      //   destination: "http://localhost:3000/api/v1/:path*",
      // },
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
