import type { Metadata } from "next";
import { PageInPreparation } from "@/components/page-in-preparation";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a consultation with Lamido, Lamido & Co. about your objectives in Northern Nigeria.",
};

export default function ContactPage() {
  return (
    <PageInPreparation
      eyebrow="Contact"
      title="Request a Consultation."
      lead="Tell us about your organization and your objectives in Northern Nigeria. A consultation request form — connected to a secure backend — is being prepared for this page, together with the company's official contact details."
      planned={[
        "Consultation enquiry form (secure, privacy-minimising)",
        "Official company contact details",
        "What to expect after you enquire",
      ]}
      note="The enquiry form will be connected to a secure backend in a later build stage, and official contact details will be published only once confirmed by the company — no placeholder contact information will be displayed in the meantime."
    />
  );
}
