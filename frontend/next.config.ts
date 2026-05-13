import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Phaser ships ESM with browser globals; keep Turbopack from choking on it.
  transpilePackages: ["phaser"],
};

export default nextConfig;
