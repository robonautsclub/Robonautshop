import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables next/navigation's forbidden()/unauthorized() — used by the
  // admin role gate (tasks/phase-12-wire-up/79a-admin-route-protection.md)
  // and app/forbidden.tsx / app/unauthorized.tsx (tasks 98-99).
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

// Lets local `next dev` reach the local versions of Cloudflare bindings
// (D1, R2, etc.) configured in wrangler.jsonc, the same way the deployed
// Worker would. Only affects local development.
initOpenNextCloudflareForDev();
