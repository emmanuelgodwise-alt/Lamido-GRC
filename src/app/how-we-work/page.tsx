import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "The engagement cycle of Lamido, Lamido & Co.: Discover, Assess, Connect, Coordinate, Report — under written mandate.",
};

export default function HowWeWorkPage() {
  return (
    <PageInPreparation
      eyebrow="How We Work"
      title="A disciplined, documented engagement cycle."
      lead="Every mandate follows the same five-step rhythm: Discover, Assess, Connect, Coordinate, Report. This page will explain each step in detail — including documentation, partner verification, transparent engagement, confidentiality, and follow-through."
      planned={[
        "The five-step engagement cycle in detail",
        "Documentation and mandate process",
        "Partner verification and due diligence",
        "Confidentiality and reporting standards",
      ]}
      note="The full How We Work page is scheduled for the next build stage (Stage 2) of the development plan."
    />
  );
}
