/**
 * Engagement model and responsible-representation principles.
 *
 * Wording reflects the project brief: no guarantees of contracts, awards,
 * approvals, or investment returns; regulated services via qualified
 * professional partners.
 */
export interface EngagementStep {
  title: string;
  description: string;
}

export const engagementSteps: readonly EngagementStep[] = [
  {
    title: "Discover",
    description:
      "We listen first — understanding your objectives, constraints, and the outcomes you need in Northern Nigeria.",
  },
  {
    title: "Assess",
    description:
      "We map the relevant institutions, stakeholders, and regulations, and chart a realistic pathway for your engagement.",
  },
  {
    title: "Connect",
    description:
      "We open the right doors — introducing you to verified counterparts and coordinating initial engagement.",
  },
  {
    title: "Coordinate",
    description:
      "We manage the practical follow-through — correspondence, meetings, protocol, and local logistics.",
  },
  {
    title: "Report",
    description:
      "We keep you informed with clear, honest reporting on progress, risks, and recommended next steps.",
  },
];

export interface Principle {
  title: string;
  description: string;
}

export const principles: readonly Principle[] = [
  {
    title: "Written mandates",
    description:
      "Every representation engagement is defined by a documented mandate that sets out scope, authority, and accountability.",
  },
  {
    title: "Confidentiality by default",
    description:
      "Enquiries and engagements are handled with discretion, and information is shared only as agreed with you.",
  },
  {
    title: "Transparent fees",
    description:
      "Fees and commissions are clearly agreed in writing before work begins. No hidden arrangements.",
  },
  {
    title: "Due diligence",
    description:
      "Partners, suppliers, and counterparties are verified before any introduction is made.",
  },
  {
    title: "Conflict-of-interest disclosure",
    description:
      "Any potential conflict of interest is disclosed openly, before it can become a problem.",
  },
  {
    title: "No guaranteed outcomes",
    description:
      "We never promise contracts, awards, approvals, or investment returns. We build credible, well-coordinated engagement.",
  },
];

export const regulatedServicesNote =
  "Where a service requires licensed professional expertise — legal, financial, or otherwise regulated — we engage qualified professional partners.";
