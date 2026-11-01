"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BRANDS } from "../../domain/brands";
import { useLab } from "../lab-provider";

/** Keeps navigation real until the screen lands. Shows that lab state survives the route change. */
export function RoutePlaceholder({ title, summary }: Readonly<{ title: string; summary: string }>) {
  const { state } = useLab();
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 py-12 md:px-7">
      <p className="text-label-mono tracking-wider text-ink-muted uppercase">
        Active brand: {BRANDS[state.brandId].name}
      </p>
      <h1 className="font-display text-headline-lg">{title}</h1>
      <p className="text-body-lg text-ink-muted">{summary}</p>
      <Link
        href="/"
        className="flex h-9 items-center gap-1.5 rounded-control bg-ink px-4 text-label-lg text-canvas transition-colors duration-150 hover:bg-[#2e3632]"
      >
        <ArrowLeft aria-hidden size={16} />
        Back to Playground
      </Link>
    </section>
  );
}
