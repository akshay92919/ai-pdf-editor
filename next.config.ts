import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle pdf-parse and mammoth, 
  // which use node-canvas or pdf.js DOM heavily and crash the build.
  serverExternalPackages: ["pdf-parse", "mammoth", "pdf-lib"],
};

export default nextConfig;
