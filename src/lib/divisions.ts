/**
 * The five service divisions of Lamido, Lamido & Co.
 *
 * Exact names, order, and numbering are contractual brand invariants defined
 * in the project brief and guarded by tests (tests/brand.test.ts).
 * Do not rename, reorder, or add divisions without owner approval.
 */
export interface ServiceDivision {
  id: string;
  number: string;
  name: string;
  shortName: string;
  summary: string;
  subservices: readonly string[];
}

export const serviceDivisions: readonly ServiceDivision[] = [
  {
    id: "regional-representation-institutional-liaison",
    number: "01",
    name: "Regional Representation & Institutional Liaison",
    shortName: "Regional Representation",
    summary:
      "Standing local representation, government and institutional liaison, and corporate affairs for organizations with interests in Northern Nigeria.",
    subservices: [
      "Local representation",
      "Government and institutional liaison",
      "Corporate affairs",
      "Delegation protocol",
      "Regional account management and continuing representation",
      "Official correspondence and follow-up coordination",
    ],
  },
  {
    id: "market-entry-business-development",
    number: "02",
    name: "Market Entry & Business Development",
    shortName: "Market Entry",
    summary:
      "Research-led market entry, expansion strategy, sales representation, and customer development across the region.",
    subservices: [
      "Market research",
      "Regional expansion strategies",
      "Sales representation",
      "Customer acquisition",
      "Commercial intelligence",
      "Competitor and customer research",
      "Field research",
      "Regional market-entry planning",
    ],
  },
  {
    id: "strategic-partnerships-investment-facilitation",
    number: "03",
    name: "Strategic Partnerships & Investment Facilitation",
    shortName: "Partnerships & Investment",
    summary:
      "Partner identification, supplier verification, joint-venture development, and carefully introduced investment opportunities.",
    subservices: [
      "Partner identification",
      "Supplier sourcing and vendor verification",
      "Joint-venture and consortium development",
      "Investor introductions",
      "Investment opportunity sourcing",
      "Local partner assessment and coordination",
    ],
  },
  {
    id: "project-trade-procurement-support",
    number: "04",
    name: "Project, Trade & Procurement Support",
    shortName: "Project, Trade & Procurement",
    summary:
      "Tender intelligence, procurement support, trade facilitation, and hands-on local coordination for projects and transactions.",
    subservices: [
      "Tender intelligence",
      "Procurement opportunity support",
      "Trade and export-import facilitation",
      "Local project coordination",
      "Business missions and trade events",
      "Supplier and project implementation coordination",
      "After-sales support coordination",
    ],
  },
  {
    id: "international-development-regional-programmes",
    number: "05",
    name: "International Development & Regional Programmes",
    shortName: "Development & Programmes",
    summary:
      "Liaison, field research, and implementation coordination for development partners, NGOs, and donor programmes in the region.",
    subservices: [
      "Development-partner liaison",
      "International NGO and donor-programme support",
      "Field research",
      "Stakeholder consultations",
      "Community relations coordination",
      "Programme implementation coordination",
      "Monitoring, progress reporting and local partner liaison",
    ],
  },
];
