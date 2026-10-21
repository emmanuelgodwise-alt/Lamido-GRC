/**
 * Sectors Lamido, Lamido & Co. can support.
 *
 * Presented as areas of service support — NOT claims of proven expertise,
 * completed projects, or existing relationships (per the project brief).
 */
export interface Sector {
  id: string;
  name: string;
  summary: string;
}

export const sectors: readonly Sector[] = [
  {
    id: "agriculture",
    name: "Agriculture, Food Production & Agro-Processing",
    summary:
      "Support for agribusinesses, food processors, and organizations engaging agro-value chains across the region.",
  },
  {
    id: "mining",
    name: "Mining, Solid Minerals & Industrial Development",
    summary:
      "Guidance and coordination for organizations exploring solid-mineral opportunities and industrial projects.",
  },
  {
    id: "energy",
    name: "Energy, Renewable Power & Infrastructure",
    summary:
      "Coordination for energy, renewable-power, and infrastructure engagement, including partner identification.",
  },
  {
    id: "healthcare-education-technology",
    name: "Healthcare, Education & Technology",
    summary:
      "Practical support for organizations bringing health, education, and technology initiatives to the region.",
  },
  {
    id: "trade-logistics-manufacturing",
    name: "Trade, Logistics & Manufacturing",
    summary:
      "Representation and coordination for trading houses, logistics providers, and manufacturers building regional operations.",
  },
];
