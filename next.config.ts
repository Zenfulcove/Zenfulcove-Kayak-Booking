import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Allow up to ~6MB request bodies so photo uploads with the 5MB
      // client-side cap have headroom for FormData overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
