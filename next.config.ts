import type { NextConfig } from "next";

/**
 * Lamido, Lamido & Co. — Next.js configuration.
 *
 * `output: "export"` produces a fully static `out/` directory at build time,
 * so the site can be hosted on any static host (Vercel, Cloudflare Pages)
 * without a paid server runtime. No API routes, middleware, server actions,
 * or SSR features are used anywhere in this project.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    // Required for static export; all images are local assets served as-is.
    unoptimized: true,
  },
};

export default nextConfig;
