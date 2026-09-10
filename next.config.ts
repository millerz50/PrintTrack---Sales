import type { NextConfig } from "next";

// Vercel deployment automatically packages Next.js for serverless.
// Setting 'standalone' on Vercel causes: Error: ENOENT: no such file or directory, open '.next/next-server.js.nft.json'
const isVercel = Boolean(process.env.VERCEL);
const isStandalone = !isVercel && process.env.NEXT_OUTPUT_STANDALONE !== "false";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isStandalone ? "standalone" : undefined,
};

export default nextConfig;
