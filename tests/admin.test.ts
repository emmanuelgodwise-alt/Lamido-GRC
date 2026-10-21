import { describe, expect, test } from "bun:test";
import {
  buildCsv,
  csvFilename,
  type CsvColumn,
} from "../src/lib/admin/csv";
import {
  ENQUIRY_STATUSES,
  isEnquiryStatus,
  statusLabels,
} from "../src/lib/admin/status";
import { MAX_NOTES_LENGTH } from "../src/lib/admin/queries";

/**
 * Stage 5 tests — CSV formula-injection safety, status metadata,
 * notes limits, and security posture assertions (SW exclusion, robots,
 * noindex, no service-role usage in admin code).
 */

interface TestRow {
  reference: string;
  name: string;
  notes: string | null;
}

const columns: readonly CsvColumn<TestRow>[] = [
  { header: "Reference", value: (row) => row.reference },
  { header: "Name", value: (row) => row.name },
  { header: "Notes", value: (row) => row.notes },
];

describe("CSV formula-injection protection", () => {
  test("formula-leading cells are neutralized with a leading quote", () => {
    const csv = buildCsv(
      [{ reference: "LLC-1", name: "=SUM(A1:A9)", notes: null }],
      columns,
    );
    expect(csv).toContain("'=SUM(A1:A9)");
  });

  test("all dangerous prefixes are neutralized", () => {
    const dangerous = ["=cmd", "+1", "-2", "@x", "\ttab", "\rCR"];
    for (const [index, value] of dangerous.entries()) {
      const csv = buildCsv(
        [{ reference: `LLC-${index}`, name: value, notes: null }],
        columns,
      );
      // The guarded cell always contains the single-quote prefix directly
      // before the dangerous content (whether or not RFC quoting wrapped it).
      expect(csv).toContain(`'${value}`);
    }
  });

  test("normal cells pass through untouched", () => {
    const csv = buildCsv(
      [{ reference: "LLC-1", name: "Amina Yusuf", notes: "Follow up Monday" }],
      columns,
    );
    expect(csv).toBe("Reference,Name,Notes\r\nLLC-1,Amina Yusuf,Follow up Monday");
  });

  test("commas, quotes, and newlines are RFC 4180 quoted", () => {
    const csv = buildCsv(
      [
        {
          reference: "LLC-1",
          name: 'Smith, "Co"',
          notes: "line one\nline two",
        },
      ],
      columns,
    );
    expect(csv).toContain('"Smith, ""Co"""');
    expect(csv).toContain('"line one\nline two"');
  });

  test("null and undefined render as empty cells", () => {
    const csv = buildCsv([{ reference: "LLC-1", name: "X", notes: null }], columns);
    expect(csv.endsWith("LLC-1,X,")).toBe(true);
  });

  test("header row is included", () => {
    const csv = buildCsv([], columns);
    expect(csv).toBe("Reference,Name,Notes");
  });

  test("filename is timestamped and UTC-labelled", () => {
    expect(csvFilename()).toMatch(
      /^lamido-enquiries-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-UTC\.csv$/,
    );
  });
});

describe("status metadata", () => {
  test("statuses match the database CHECK constraint exactly", () => {
    expect([...ENQUIRY_STATUSES]).toEqual(["new", "in_review", "contacted", "closed"]);
  });

  test("every status has a human label", () => {
    for (const status of ENQUIRY_STATUSES) {
      expect(statusLabels[status].length).toBeGreaterThan(0);
    }
  });

  test("isEnquiryStatus guards unknown values", () => {
    expect(isEnquiryStatus("new")).toBe(true);
    expect(isEnquiryStatus("closed")).toBe(true);
    expect(isEnquiryStatus("deleted")).toBe(false);
    expect(isEnquiryStatus("")).toBe(false);
    expect(isEnquiryStatus(null)).toBe(false);
  });
});

describe("limits mirror the database constraints", () => {
  test("notes length matches the migration limit", () => {
    expect(MAX_NOTES_LENGTH).toBe(10000);
  });
});

describe("security posture (source assertions)", () => {
  test("the service worker excludes /admin from all caching", async () => {
    const sw = await Bun.file("public/sw.js").text();
    expect(sw.includes("/\\/admin(\\/|$)/")).toBe(true);
  });

  test("robots.txt disallows /admin", async () => {
    const robots = await Bun.file("src/app/robots.ts").text();
    expect(robots.includes('"/admin"')).toBe(true);
  });

  test("the admin page is noindex", async () => {
    const page = await Bun.file("src/app/admin/page.tsx").text();
    expect(page.includes("index: false")).toBe(true);
  });

  test("admin client code contains no service-role usage", async () => {
    const usagePatterns = ["SERVICE_ROLE", "service_role", "serviceRole"];
    for (const path of [
      "src/components/admin/admin-dashboard.tsx",
      "src/components/admin/login-panel.tsx",
      "src/components/admin/enquiry-list.tsx",
      "src/components/admin/enquiry-detail.tsx",
      "src/lib/admin/queries.ts",
      "src/lib/admin/csv.ts",
      "src/lib/admin/status.ts",
    ]) {
      const source = await Bun.file(path).text();
      for (const pattern of usagePatterns) {
        expect(source.includes(pattern)).toBe(false);
      }
    }
  });

  test("the sitemap excludes /admin and /offline", async () => {
    const sitemap = await Bun.file("src/app/sitemap.ts").text();
    expect(sitemap.includes('"/admin"')).toBe(false);
    expect(sitemap.includes('"/offline"')).toBe(false);
  });
});
