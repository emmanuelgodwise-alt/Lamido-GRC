import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Lamido, Lamido & Co. website.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <PageInPreparation
      eyebrow="Legal"
      title="Terms of Use."
      lead="The Terms of Use will set out the basis on which this website is provided, limitations of liability, and the terms that apply to information submitted through the enquiry system."
      planned={[
        "Basis of use of this website",
        "No-representation limitations",
        "Limitation of liability",
        "Governing terms",
      ]}
      note="Draft terms will be provided for owner and legal counsel review before publication — no legal review has occurred yet."
    />
  );
}
