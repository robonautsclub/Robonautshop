import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
