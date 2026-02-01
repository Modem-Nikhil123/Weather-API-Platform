import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    optimizePackageImports: ["react-icons", "date-fns"],
  },

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
    ],
  },
};

export default nextConfig;
