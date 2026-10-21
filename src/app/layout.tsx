import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { InstallProvider } from "@/components/pwa/install-provider";
import { InstallBanner } from "@/components/pwa/install-banner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { site } from "@/lib/site";

// Self-hosted under the SIL Open Font License (see src/fonts/LICENSE-NOTES.txt).
// Vendored locally so builds never depend on Google's CDN at build time.
const inter = localFont({
  src: [
    { path: "../fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const playfair = localFont({
  src: [
    { path: "../fonts/playfair-display-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/playfair-display-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/playfair-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.descriptor}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.descriptor}`,
    description: site.description,
    url: site.url,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.descriptor}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.descriptor}`,
    description: site.description,
    images: ["/brand/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2E59",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <InstallProvider>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <InstallBanner />
        </InstallProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
