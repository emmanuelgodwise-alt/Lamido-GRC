/// <reference types="bun-types" />
/**
 * Stage 1 starter tests — brand invariants and PWA manifest.
 *
 * These tests guard the contractual brand facts from the project brief:
 * exact company spelling, exact tagline, the five service divisions (names,
 * numbering, order), the five sectors, the engagement cycle, and the PWA
 * manifest installability fields.
 *
 * Run with: bun test
 */
import { describe, expect, test } from "bun:test";
import { serviceDivisions } from "../src/lib/divisions";
import { sectors } from "../src/lib/sectors";
import { engagementSteps, principles } from "../src/lib/engagement";
import { site, resolveSiteUrl } from "../src/lib/site";
import buildManifest from "../src/app/manifest";

const manifest = buildManifest();

const EXPECTED_DIVISION_NAMES = [
  "Regional Representation & Institutional Liaison",
  "Market Entry & Business Development",
  "Strategic Partnerships & Investment Facilitation",
  "Project, Trade & Procurement Support",
  "International Development & Regional Programmes",
];

const EXPECTED_SECTOR_NAMES = [
  "Agriculture, Food Production & Agro-Processing",
  "Mining, Solid Minerals & Industrial Development",
  "Energy, Renewable Power & Infrastructure",
  "Healthcare, Education & Technology",
  "Trade, Logistics & Manufacturing",
];

describe("brand invariants", () => {
  test("official company name and tagline are exact", () => {
    expect(site.name).toBe("Lamido, Lamido & Co.");
    expect(site.shortName).toBe("Lamido & Co.");
    expect(site.descriptor).toBe("Global Resource Company");
    expect(site.tagline).toBe(
      "Your Trusted Regional Representative and Strategic Partner in Northern Nigeria."
    );
  });

  test("company name never contains the forbidden 'Lanmido' spelling", () => {
    for (const division of serviceDivisions) {
      expect(division.name).not.toMatch(/lanmido/i);
      expect(division.summary).not.toMatch(/lanmido/i);
    }
    expect(site.name).not.toMatch(/lanmido/i);
  });

  test("five service divisions use exact names, numbering, and order", () => {
    expect(serviceDivisions).toHaveLength(5);
    expect(serviceDivisions.map((d) => d.name)).toEqual(EXPECTED_DIVISION_NAMES);
    expect(serviceDivisions.map((d) => d.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
  });

  test("each division has a summary, unique slug, and subservices from the brief", () => {
    const ids = new Set<string>();
    for (const division of serviceDivisions) {
      expect(division.summary.length).toBeGreaterThan(60);
      expect(division.subservices.length).toBeGreaterThanOrEqual(6);
      expect(division.id).toMatch(/^[a-z0-9-]+$/);
      ids.add(division.id);
    }
    expect(ids.size).toBe(5);
  });

  test("five sectors use the exact agreed names", () => {
    expect(sectors).toHaveLength(5);
    expect(sectors.map((s) => s.name)).toEqual(EXPECTED_SECTOR_NAMES);
  });

  test("engagement cycle is Discover, Assess, Connect, Coordinate, Report", () => {
    expect(engagementSteps.map((s) => s.title)).toEqual([
      "Discover",
      "Assess",
      "Connect",
      "Coordinate",
      "Report",
    ]);
  });

  test("principles include the no-guarantees commitment", () => {
    expect(
      principles.some((p) => /no guaranteed outcomes/i.test(p.title))
    ).toBeTrue();
  });
});

describe("PWA manifest", () => {
  test("declares required installability fields with brand values", () => {
    expect(manifest.name).toBe("Lamido, Lamido & Co.");
    expect(manifest.short_name).toBe("Lamido & Co.");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.theme_color).toBe("#0B2E59");
    expect(manifest.background_color).toBe("#FFFFFF");
  });

  test("provides 192 and 512 icons plus maskable variants", () => {
    const icons = manifest.icons ?? [];
    expect(icons.length).toBeGreaterThanOrEqual(4);
    expect(icons.some((i) => i.sizes === "192x192" && !i.purpose)).toBeTrue();
    expect(icons.some((i) => i.sizes === "512x512" && !i.purpose)).toBeTrue();
    expect(
      icons.some((i) => i.sizes === "192x192" && i.purpose === "maskable")
    ).toBeTrue();
    expect(
      icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable")
    ).toBeTrue();
    for (const icon of icons) {
      expect(icon.type).toBe("image/png");
      expect(icon.src).toMatch(/^\/icons\/icon-\d+(?:-maskable)?\.png$/);
    }
  });
});

describe("canonical URL resolution (no localhost in deployed builds)", () => {
  test("explicit NEXT_PUBLIC_SITE_URL wins and trailing slashes are stripped", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://lamidogrc.com/" })
    ).toBe("https://lamidogrc.com");
  });

  test("Vercel production URL is used automatically when set", () => {
    expect(
      resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "lam-group.vercel.app" })
    ).toBe("https://lam-group.vercel.app");
  });

  test("Vercel deployment URL is the preview fallback", () => {
    expect(resolveSiteUrl({ VERCEL_URL: "lam-group-abc123.vercel.app" })).toBe(
      "https://lam-group-abc123.vercel.app"
    );
  });

  test("explicit domain outranks Vercel auto URLs", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://lamidogrc.com",
        VERCEL_PROJECT_PRODUCTION_URL: "lam-group.vercel.app",
      })
    ).toBe("https://lamidogrc.com");
  });

  test("localhost is the local-development fallback only", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });
});
