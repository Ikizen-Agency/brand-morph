import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage, statusAction } from "@/brand-lab/ui/shell/status-page";

export const metadata: Metadata = { title: "Page not found | Brand Morph" };

export default function NotFound() {
  return (
    <StatusPage label="Error 404" title="This page is not in the lab">
      <p className="text-body-md text-ink-muted">
        The link may be old, or the address may have a typo. Your brand and tuning are still saved.
      </p>
      <Link href="/" className={statusAction}>
        Back to the Playground
      </Link>
    </StatusPage>
  );
}
