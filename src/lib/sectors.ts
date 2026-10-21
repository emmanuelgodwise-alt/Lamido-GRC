/**
 * Sectors Lamido, Lamido & Co. can support.
 *
 * Presented as areas of service support — NOT claims of proven expertise,
 * completed projects, or existing relationships (per the project brief).
 * `support` items describe the kind of help available in each sector.
 */
export interface Sector {
  id: string;
  name: string;
  summary: string;
  /** Examples of the support this firm can provide in the sector. */
  support: readonly string[];
}

export const sectors: readonly Sector[] = [
  {
    id: "agriculture",
    name: "Agriculture, Food Production & Agro-Processing",
    summary:
      "Support for agribusinesses, food processors, and organizations engaging agro-value chains across the region.",
    support: [
      "Market research on crops, inputs, processing, and distribution",
      "Partner and outgrower-scheme identification with verification",
      "Liaison with relevant agricultural institutions and programmes",
      "Coordination of sourcing, logistics, and implementation follow-up",
    ],
  },
  {
    id: "mining",
    name: "Mining, Solid Minerals & Industrial Development",
    summary:
      "Guidance and coordination for organizations exploring solid-mineral opportunities and industrial projects.",
    support: [
      "Regulatory and institutional pathway mapping for mineral sector engagement",
      "Partner, community, and stakeholder identification and consultations",
      "Coordination with qualified professional partners for licensed technical work",
      "Field research and implementation coordination for industrial projects",
    ],
  },
  {
    id: "energy",
    name: "Energy, Renewable Power & Infrastructure",
    summary:
      "Coordination for energy, renewable-power, and infrastructure engagement, including partner identification.",
    support: [
      "Stakeholder and institutional mapping for energy and infrastructure initiatives",
      "Local partner identification, assessment, and verification",
      "Opportunity and tender monitoring in the sector",
      "Project coordination and progress reporting during implementation",
    ],
  },
  {
    id: "healthcare-education-technology",
    name: "Healthcare, Education & Technology",
    summary:
      "Practical support for organizations bringing health, education, and technology initiatives to the region.",
    support: [
      "Institutional liaison for health, education, and technology programmes",
      "Field research and stakeholder consultations for initiative design",
      "Partner identification for distribution, delivery, and implementation",
      "Coordination support for pilot programmes and donor-funded initiatives",
    ],
  },
  {
    id: "trade-logistics-manufacturing",
    name: "Trade, Logistics & Manufacturing",
    summary:
      "Representation and coordination for trading houses, logistics providers, and manufacturers building regional operations.",
    support: [
      "Market-entry research for consumer and industrial products",
      "Trade, export-import, and logistics facilitation coordination",
      "Distributor and supplier identification with verification",
      "Manufacturing and assembly initiative coordination",
    ],
  },
];
