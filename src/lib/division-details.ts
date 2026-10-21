/**
 * Stage 2 division detail content.
 *
 * Every division detail page is generated from this typed configuration so
 * navigation, service pages, and detail pages can never diverge. The record
 * is keyed by division id and typed against the canonical division list —
 * TypeScript guarantees all five divisions are covered.
 *
 * Content rules (project brief): describe services and working method only;
 * never claim clients, projects, results, government endorsement, or
 * guaranteed outcomes; regulated services via qualified professional
 * partners.
 */
import { serviceDivisions } from "@/lib/divisions";

export type DivisionId = (typeof serviceDivisions)[number]["id"];

export interface DivisionDetail {
  /** One-paragraph statement of what this division does and for whom. */
  purpose: string;
  /** Client problems this division helps address. */
  problems: readonly string[];
  /** Typical engagement flow, in order. */
  engagementFlow: readonly {
    title: string;
    description: string;
  }[];
  /** Likely client types (presented as examples, never as claimed clients). */
  clientTypes: readonly string[];
  /** What a client can expect from an engagement (working deliverables). */
  deliverables: readonly string[];
  /** Boundaries and disclaimer for this division. */
  boundaries: string;
}

export const divisionDetails: Record<DivisionId, DivisionDetail> = {
  "regional-representation-institutional-liaison": {
    purpose:
      "Organizations with interests in Northern Nigeria need a credible, continuously present representative rather than occasional visits. This division provides standing local representation and structured liaison with governments and public institutions — always under a written mandate that defines exactly what we are authorized to do on your behalf.",
    problems: [
      "Regional affairs are managed from another country and time zone, so opportunities and correspondence move slowly.",
      "The institutional landscape — which offices, agencies, and stakeholders matter for your objective — is unfamiliar territory.",
      "Official correspondence and follow-up need a consistent, accountable local point of contact.",
      "Delegations and visiting executives arrive without the protocol preparation and briefings that make engagements productive.",
      "There is no single representative who holds institutional memory of your engagements in the region.",
    ],
    engagementFlow: [
      {
        title: "Define the mandate",
        description:
          "We agree in writing the scope of representation, the authority granted, the institutions in scope, and reporting expectations.",
      },
      {
        title: "Map the landscape",
        description:
          "We identify the institutions, offices, and stakeholders relevant to your objective, and the practical pathway for engaging them.",
      },
      {
        title: "Represent and liaise",
        description:
          "We act as your local representative — carrying correspondence, preparing engagements, and maintaining your presence between visits.",
      },
      {
        title: "Coordinate follow-through",
        description:
          "We track commitments, confirm next steps, and keep the relevant parties moving between your engagements.",
      },
      {
        title: "Report",
        description:
          "You receive clear, honest reporting on activity, developments, risks, and recommended actions.",
      },
    ],
    clientTypes: [
      "Foreign corporations with ongoing interests in Northern Nigeria",
      "Public institutions and trade-promotion bodies",
      "International organizations with regional engagements",
      "Investors and companies establishing a first presence in the region",
    ],
    deliverables: [
      "A written mandate defining scope, authority, and accountability",
      "An institutional and stakeholder map for your objective",
      "Managed official correspondence and follow-up records",
      "Delegation briefings, protocol preparation, and engagement support",
      "Periodic representation activity and developments reports",
    ],
    boundaries:
      "Representation is exercised strictly within the authority granted by each written mandate and applicable rules. Lamido, Lamido & Co. does not hold diplomatic status, does not imply government endorsement, and makes no promise of any official decision or outcome.",
  },

  "market-entry-business-development": {
    purpose:
      "Entering a new region on assumptions is expensive. This division provides research-led market entry and business development — grounding your decisions in field-verified information about demand, competition, channels, and the practical realities of operating in Northern Nigeria.",
    problems: [
      "You are considering the region but lack grounded market information to justify or shape an entry decision.",
      "Demand, pricing, distribution, and competitor realities on the ground are unclear from desk research alone.",
      "You need a local sales or business-development presence but are not ready to commit to a full office.",
      "Customer expectations and business culture differ from your home market, and early approaches need local shaping.",
      "Field research, interviews, and verification require people who can operate credibly in the region.",
    ],
    engagementFlow: [
      {
        title: "Scope the question",
        description:
          "We define the specific decisions your entry plan must answer, so research is targeted rather than generic.",
      },
      {
        title: "Research",
        description:
          "Desk research is combined with field research and structured interviews to test assumptions against reality.",
      },
      {
        title: "Plan the entry",
        description:
          "We translate findings into a practical market-entry roadmap: sequencing, channels, partners, and representation needs.",
      },
      {
        title: "Support execution",
        description:
          "Sales representation, customer development, and early engagements are coordinated on your behalf.",
      },
      {
        title: "Review and adjust",
        description:
          "Progress is reported honestly, and the plan is adjusted as the market responds.",
      },
    ],
    clientTypes: [
      "Exporters and manufacturers evaluating the regional market",
      "Service companies planning regional expansion",
      "B2B suppliers seeking representation or distribution",
      "Companies testing demand before committing to a permanent presence",
    ],
    deliverables: [
      "A market assessment grounded in desk and field research",
      "Competitor and customer research summaries",
      "A regional market-entry roadmap with sequenced practical steps",
      "Coordinated early customer and partner engagements",
      "Business-development progress reporting",
    ],
    boundaries:
      "Research findings are honest assessments of what we observe — not guarantees of demand, revenue, or market success. Entry decisions and their commercial risks remain with the client.",
  },

  "strategic-partnerships-investment-facilitation": {
    purpose:
      "Credible partnerships depend on credible counterparties. This division identifies and verifies potential partners, suppliers, and investment opportunities in Northern Nigeria — developing joint ventures and consortium arrangements, and making introductions only after verification and with your agreement.",
    problems: [
      "Finding genuinely capable and reliable local partners is difficult from a distance.",
      "Suppliers and counterparties need independent verification before commitments are made.",
      "Joint-venture and consortium discussions need a coordinator who understands both sides.",
      "Investment opportunities in the region need sourcing, screening, and sober assessment.",
      "Early partnership discussions stall without structured follow-through on both sides.",
    ],
    engagementFlow: [
      {
        title: "Understand the objective",
        description:
          "We define what a successful partner, supplier, or opportunity looks like for you — criteria first, names second.",
      },
      {
        title: "Identify candidates",
        description:
          "We build a long-list of potential counterparties matching your criteria, refined into a considered short-list.",
      },
      {
        title: "Verify",
        description:
          "Basic verification and due-diligence coordination are completed before any introduction is made.",
      },
      {
        title: "Introduce and structure",
        description:
          "Introductions are arranged with your agreement, and we help coordinate discussions, including joint-venture and consortium development.",
      },
      {
        title: "Coordinate",
        description:
          "We stay engaged through negotiation and early implementation, keeping both sides moving and informed.",
      },
    ],
    clientTypes: [
      "Foreign investors sourcing and screening regional opportunities",
      "Companies seeking joint ventures, consortium partners, or distributors",
      "Procurement teams that need suppliers independently verified",
      "Development financiers requiring local partner assessment",
    ],
    deliverables: [
      "Agreed partner or supplier criteria",
      "Long-list and short-list of verified candidates",
      "Verification and due-diligence coordination summaries",
      "Structured introductions and coordination of early discussions",
      "Ongoing coordination through negotiation and implementation",
    ],
    boundaries:
      "We facilitate introductions, verification, and coordination. We do not provide licensed legal, financial, or investment advice — regulated work is delivered with qualified professional partners — and no investment return, deal completion, or partnership outcome is ever promised.",
  },

  "project-trade-procurement-support": {
    purpose:
      "Projects, trade, and procurement in the region reward preparation and punish distance. This division provides tender intelligence, procurement-opportunity support, trade and export-import facilitation, and hands-on local coordination — from first opportunity to after-sales follow-through.",
    problems: [
      "Relevant tender and procurement opportunities are missed or noticed too late to respond well.",
      "Import, export, and trade procedures are complex and slow without experienced local handling.",
      "Projects in the region need a local coordinator for suppliers, site logistics, and implementation follow-up.",
      "Trade missions and business events need groundwork to be worth the trip.",
      "Deliveries and installations need after-sales coordination so commitments are honoured in practice.",
    ],
    engagementFlow: [
      {
        title: "Brief",
        description:
          "We agree the markets, sectors, and opportunity types that matter to you, and the support you need around them.",
      },
      {
        title: "Watch and qualify",
        description:
          "We monitor relevant tender and procurement activity and qualify opportunities against your criteria.",
      },
      {
        title: "Support the response",
        description:
          "We coordinate the practical side of bidding and transacting — documentation, clarifications, logistics, and timing.",
      },
      {
        title: "Coordinate delivery",
        description:
          "For winning efforts, we coordinate local implementation, suppliers, and schedules on your behalf.",
      },
      {
        title: "Follow through",
        description:
          "After-sales support coordination and honest progress reporting close the loop.",
      },
    ],
    clientTypes: [
      "Exporters and importers active in the region",
      "Contractors and suppliers pursuing public or private tenders",
      "Trade missions and business delegations",
      "Companies delivering projects with local implementation requirements",
    ],
    deliverables: [
      "Qualified tender and procurement opportunity alerts",
      "Bid and transaction support coordination",
      "Trade and export-import facilitation and documentation coordination",
      "Business-mission and trade-event preparation and support",
      "Implementation and after-sales coordination reporting",
    ],
    boundaries:
      "No tender award, contract win, or procurement outcome is guaranteed, and no influence over any official process is offered or implied. All tender, trade, and procurement activity follows the official rules that govern it.",
  },

  "international-development-regional-programmes": {
    purpose:
      "Development partners working in Northern Nigeria need local counterparts they can rely on for research, consultation, and coordination. This division supports international NGOs, donors, and programme implementers with development-partner liaison, field research, stakeholder consultations, community-relations coordination, and programme implementation support.",
    problems: [
      "Programme design needs grounded field research and local stakeholder input, not assumptions.",
      "Consultations and community engagement require credible local facilitation.",
      "Implementing partners in the region need identification, assessment, and coordination.",
      "Programme monitoring and progress reporting need dependable local eyes and ears.",
      "Relationships with development stakeholders need consistent liaison between missions.",
    ],
    engagementFlow: [
      {
        title: "Scope together",
        description:
          "We agree the research questions, consultation needs, or coordination scope the programme requires.",
      },
      {
        title: "Map and prepare",
        description:
          "We identify relevant stakeholders, communities, and local partners, and prepare the engagement approach.",
      },
      {
        title: "Deliver",
        description:
          "Field research, consultations, and liaison are delivered to the agreed protocol and safeguarding requirements.",
      },
      {
        title: "Coordinate",
        description:
          "Local partners, activities, and timelines are coordinated in support of programme implementation.",
      },
      {
        title: "Report",
        description:
          "Monitoring inputs and progress reports are prepared honestly and on schedule.",
      },
    ],
    clientTypes: [
      "International NGOs and foundations",
      "Donors and development agencies",
      "Programme implementers requiring local research or consultation capacity",
      "Organizations needing local partner liaison for regional programmes",
    ],
    deliverables: [
      "Field research and stakeholder-consultation outputs",
      "Stakeholder and local-partner mappings",
      "Community-relations coordination support",
      "Programme implementation coordination records",
      "Monitoring inputs and progress reporting",
    ],
    boundaries:
      "Programme support is delivered within each programme's rules, protocols, and safeguarding requirements. Lamido, Lamido & Co. is an independent company and does not claim affiliation with, or endorsement by, any donor, agency, or government.",
  },
};
