import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "Sectors Lamido, Lamido & Co. can support in Northern Nigeria: agriculture and agro-processing, mining and industry, energy and infrastructure, healthcare, education and technology, trade, logistics and manufacturing.",
};

export default function SectorsPage() {
  return (
    <PageInPreparation
      eyebrow="Sectors"
      title="Sectors we can support."
      lead="From agriculture and solid minerals to energy, healthcare, and trade — these are areas in which we can support engagement in Northern Nigeria. They are presented as capability areas, not claims of completed projects or existing relationships. The detailed sector pages are being prepared."
      planned={[
        "Sector-by-sector support overview",
        "Relevant service divisions for each sector",
        "How to start a sector-specific conversation",
      ]}
      note="The full Sectors page is scheduled for the next build stage (Stage 2) of the development plan."
    />
  );
}
