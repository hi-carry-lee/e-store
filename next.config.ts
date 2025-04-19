import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/f/**",
      },
    ],
    // Added unoptimized: true in development mode to bypass image optimization
    // 因为在开发环境中，图片会被优化，导致有时候无法显示
    unoptimized: process.env.NODE_ENV === "development", // Disable optimization in development
  },
};

export default nextConfig;
