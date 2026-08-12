import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  // opentimestamps pulls in Node-only CommonJS deps (bitcore-lib, request).
  // Keep them external so they run as real Node modules instead of being
  // bundled, which avoids Turbopack/webpack resolution issues.
  serverExternalPackages: [
    "opentimestamps",
    "postgres",
    "mailparser",
    "dkim-verifier",
  ],
  // Next 16 defaults to Turbopack; keep an empty turbopack block so a webpack
  // polyfill config (buffer) does not fail the build.
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };
    }
    return config;
  },
};

export default nextConfig;
