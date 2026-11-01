import type { Metadata } from "next";
import { RoutePlaceholder } from "@/brand-lab/ui/shell/route-placeholder";

export const metadata: Metadata = { title: "Components | Brand Morph" };

export default function ComponentsPage() {
  return (
    <RoutePlaceholder
      title="Components"
      summary="The component gallery is coming next. It will restyle every specimen for the active brand."
    />
  );
}
