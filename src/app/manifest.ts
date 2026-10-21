import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Required for static export (output: 'export'). */
export const dynamic = "force-static";

/**
 * Static PWA manifest (generated at build time as /manifest.webmanifest).
 * Installability is targeted from Stage 1 per owner instruction; full
 * on-device verification is completed in Stage 6.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0B2E59",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
