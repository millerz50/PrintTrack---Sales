import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Only use standalone output when explicitly requested, preventing Vercel nft error
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
