import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /r/:slug stays as raw HTML for Telegram Instant View
      // Old /posts/:slug links still work
    ];
  },
};

export default nextConfig;
