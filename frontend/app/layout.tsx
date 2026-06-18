import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://outran.in"),
  title: {
    default: "OUTRAN Tank Cover System",
    template: "%s | OUTRAN"
  },
  description: "Premium tactical motorcycle tank cover system for Himalayan 450. Built for the ride beyond roads.",
  openGraph: {
    title: "OUTRAN Tank Cover System",
    description: "Built for the ride beyond roads.",
    images: ["/assets/hero-page.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "OUTRAN Tank Cover System",
    description: "Built for the ride beyond roads.",
    images: ["/assets/hero-page.png"]
  },
  icons: {
    icon: "/assets/outran-logo.svg",
    shortcut: "/assets/outran-logo.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
