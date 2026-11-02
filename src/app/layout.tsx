import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { siteUrl } from "@/brand-lab/application/site-url";
import { LabProvider } from "@/brand-lab/ui/lab-provider";
import { StudioShell } from "@/brand-lab/ui/shell/studio-shell";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const description =
  "An interactive design lab by Ikizen: one product morphs across three brands from one token source, with five live exports.";

export const metadata: Metadata = {
  metadataBase: siteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  title: "Brand Morph",
  description,
  openGraph: { type: "website", siteName: "Brand Morph", title: "Brand Morph", description },
  twitter: { card: "summary_large_image", title: "Brand Morph", description },
};

export const viewport: Viewport = { themeColor: "#fbf9f5" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body>
        <LabProvider>
          <StudioShell>{children}</StudioShell>
        </LabProvider>
      </body>
    </html>
  );
}
