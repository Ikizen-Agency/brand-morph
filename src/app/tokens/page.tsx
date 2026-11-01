import type { Metadata } from "next";
import { RoutePlaceholder } from "@/brand-lab/ui/shell/route-placeholder";

export const metadata: Metadata = { title: "Tokens | Brand Morph" };

export default function TokensPage() {
  return (
    <RoutePlaceholder
      title="Tokens"
      summary="The token inspector is coming next. It will show, edit and export the active brand tokens."
    />
  );
}
