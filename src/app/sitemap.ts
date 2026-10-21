import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { serviceDivisions } from "@/lib/divisions";

/** Required for output: "export" (same as manifest.ts). */
export const dynamic = "force-static";

/**
 * Static sitemap. Public routes only — /admin, /offline, and other
 * non-content routes are deliberately excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/sectors",
    "/how-we-work",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path === "/contact" ? 0.9 : 0.8,
  }));

  const divisionRoutes = serviceDivisions.map((division) => ({
    url: `${site.url}/services/${division.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...divisionRoutes];
}
