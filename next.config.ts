import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  reactCompiler: false, // Disabling to be safe
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
