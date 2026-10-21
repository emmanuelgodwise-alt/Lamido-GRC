import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Administrator Sign In",
  description: "Internal enquiry management — authorized administrators only.",
  robots: { index: false, follow: false },
};

/**
 * /admin — static-export-compatible client route (Stage 5).
 * The page shell renders statically; all behavior is client-side against
 * Supabase Auth + RLS. The service worker never caches /admin, and this
 * page is excluded from the sitemap and disallowed in robots.txt.
 */
export default function AdminPage() {
  return <AdminDashboard />;
}
