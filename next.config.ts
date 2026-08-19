import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.resend.com https://api.clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://neon.tech",
      "frame-src https://clerk.com https://*.clerk.com https://*.clerk.accounts.dev",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // opentimestamps pulls in Node-only CommonJS deps (bitcore-lib, request).
  // Keep them external so they run as real Node modules instead of being
  // bundled, which avoids Turbopack/webpack resolution issues.
  serverExternalPackages: [
    "opentimestamps",
    "postgres",
    "mailparser",
    "dkim-verifier",
    "jsdom",
    "dompurify",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
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
