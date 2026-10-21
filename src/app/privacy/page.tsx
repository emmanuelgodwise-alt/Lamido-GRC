import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Lamido, Lamido & Co. handles enquiry information and personal data.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <PageInPreparation
      eyebrow="Legal"
      title="Privacy Notice."
      lead="The Privacy Notice will explain what enquiry information this website collects, why it is collected, who can access it, how long it is retained, and how to contact the company about personal data. It is being drafted alongside the secure enquiry system."
      planned={[
        "What enquiry data is collected and why",
        "Who can access enquiry information",
        "Retention and deletion practices",
        "How to contact the company about privacy",
      ]}
      note="Draft privacy wording will be provided for owner and legal counsel review before publication — no legal review has occurred yet."
    />
  );
}
