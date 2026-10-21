import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Required for output: "export" (same as manifest.ts). */
export const dynamic = "force-static";

/** Static robots.txt — public marketing content is crawlable. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/offline"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
