import type { ReactNode } from "react";
import { BottomTabs } from "./studio-nav";
import { StudioHeader } from "./studio-header";

export function StudioShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <StudioHeader />
      <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none sm:pb-0">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
