import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  reactCompiler: false, // Disabling to be safe
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
