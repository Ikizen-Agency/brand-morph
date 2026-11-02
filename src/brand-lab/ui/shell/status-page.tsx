import type { ReactNode } from "react";

/** Full-page message for routes that have nothing else to show, such as 404 and error states. */
export function StatusPage({
  label,
  title,
  children,
}: Readonly<{ label: string; title: string; children: ReactNode }>) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-3 px-4 py-16 sm:px-7 md:py-24">
      <p className="text-label-mono tracking-wider text-ink-muted uppercase">{label}</p>
      <h1 className="font-display text-headline-lg md:text-hero">{title}</h1>
      {children}
    </div>
  );
}

export const statusAction =
  "mt-2 flex min-h-11 items-center justify-center rounded-enclosure bg-ink px-4 text-label-lg font-semibold text-canvas transition-colors duration-150 hover:bg-[#2e3632]";
