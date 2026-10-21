import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lamido, Lamido & Co. — a global resource company representing foreign organizations, corporations, and governments in Northern Nigeria.",
};

export default function AboutPage() {
  return (
    <PageInPreparation
      eyebrow="About"
      title="A regional representative built on mandate and accountability."
      lead="Lamido, Lamido & Co. is a global resource company specializing in representing foreign organizations, corporations, companies, and governments in Northern Nigeria. The full company profile — our positioning, our approach to representation, and how we work with clients — is being prepared for this page."
      planned={[
        "Company profile and positioning",
        "Our approach to authorized representation",
        "Governance, confidentiality, and responsible representation",
        "Engagement principles and mandates",
      ]}
      note="The full About page is scheduled for the next build stage (Stage 2) of the development plan."
    />
  );
}
