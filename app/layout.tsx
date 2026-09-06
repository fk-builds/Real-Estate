import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { Footer } from "@/components/layout/footer";
import { CompareTray } from "@/components/compare-tray";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Premium Real Estate in Pakistan — Houses, Plots & New Developments`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} · Premium Estates`,
    description: site.description,
    url: "/",
    locale: "en_PK",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  keywords: [
    "property in Pakistan", "houses for sale in Lahore", "plots in Islamabad",
    "DHA Lahore", "Bahria Town", "real estate Pakistan", "Manzil",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0d5c49",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-emerald focus:text-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteShell>
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </SiteShell>
        <CompareTray />
      </body>
    </html>
  );
}
