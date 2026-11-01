import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
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

export const metadata: Metadata = {
  title: "Brand Morph",
  description: "An interactive design lab by Ikizen",
};

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
