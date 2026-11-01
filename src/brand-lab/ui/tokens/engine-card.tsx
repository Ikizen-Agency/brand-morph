"use client";

import { DraftingCompass } from "lucide-react";
import {
  contrastSummary,
  overrideCount,
  tokenCount,
} from "../../application/token-inspector";
import { EXPORT_FORMATS } from "../../domain/exporters";
import { useLab } from "../lab-provider";

export function EngineCard() {
  const { state, tokens } = useLab();
  const { passing, total } = contrastSummary(tokens.colors);

  const facts = [
    { id: "overrides", label: "Active overrides", value: `${overrideCount(state)}` },
    { id: "tokens", label: "Resolved tokens", value: `${tokenCount(tokens)}` },
    { id: "contrast", label: "Roles passing AA", value: `${passing} of ${total}` },
    { id: "formats", label: "Export formats", value: `${EXPORT_FORMATS.length}` },
  ];

  return (
    <section
      aria-labelledby="engine-heading"
      data-testid="engine-card"
      className="flex items-start gap-2.5 rounded-enclosure border border-line bg-subtle/60 p-3.5"
    >
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-control bg-elevated shadow-rest"
      >
        <DraftingCompass size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 id="engine-heading" className="text-label-lg font-semibold">
          Ikizen Design Lab Engine
        </h2>
        <p className="text-body-sm text-ink-muted">
          {tokens.brandName} resolves in your browser from one typed token set. Every export is
          generated from it, and your edits stay on this device.
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
          {facts.map(({ id, label, value }) => (
            <div key={id} className="flex flex-col">
              <dt className="text-label-md text-ink-muted">{label}</dt>
              <dd data-testid={`engine-${id}`} className="font-mono text-label-mono font-semibold">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
