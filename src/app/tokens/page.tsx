import type { Metadata } from "next";
import { TokenInspector } from "@/brand-lab/ui/tokens/token-inspector";

export const metadata: Metadata = { title: "Tokens | Brand Morph" };

export default function TokensPage() {
  return <TokenInspector />;
}
