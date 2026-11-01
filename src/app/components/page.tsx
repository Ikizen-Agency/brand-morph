import type { Metadata } from "next";
import { Gallery } from "@/brand-lab/ui/gallery/gallery";

export const metadata: Metadata = { title: "Components | Brand Morph" };

export default function ComponentsPage() {
  return <Gallery />;
}
