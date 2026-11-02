"use client";

import Link from "next/link";
import { StatusPage, statusAction } from "@/brand-lab/ui/shell/status-page";

export default function ErrorPage({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <StatusPage label="Unexpected error" title="Something broke in the lab">
      <p className="text-body-md text-ink-muted">
        This page failed to render. Your brand and tuning are saved in this browser, so trying again
        is safe.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={reset} className={statusAction}>
          Try again
        </button>
        <Link
          href="/"
          className="mt-2 flex min-h-11 items-center px-3 text-label-lg font-semibold hover:underline"
        >
          Back to the Playground
        </Link>
      </div>
    </StatusPage>
  );
}
