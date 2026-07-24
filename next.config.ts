import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // opentimestamps pulls in Node-only CommonJS deps (bitcore-lib, request).
  // Keep them external so they run as real Node modules instead of being
  // bundled, which avoids Turbopack/webpack resolution issues.
  serverExternalPackages: ["opentimestamps"],
};

export default nextConfig;
