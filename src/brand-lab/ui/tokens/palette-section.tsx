"use client";

import { Palette, Undo2 } from "lucide-react";
import { useRef } from "react";
import { COLOR_ROLE_META, overrideCount } from "../../application/token-inspector";
import { COLOR_ROLES, type ColorRole } from "../../domain/brands";
import { useLab } from "../lab-provider";
import type { Announce } from "../use-announcer";
import { ColorRoleRow } from "./color-role-row";
import type { CopyToken } from "./use-token-copy";

const rolesIn = (group: "core" | "semantic"): readonly ColorRole[] =>
  COLOR_ROLES.filter((role) => COLOR_ROLE_META[role].group === group);

export function PaletteSection({
  onCopy,
  announce,
}: Readonly<{ onCopy: CopyToken; announce: Announce }>) {
  const { state, dispatch } = useLab();
  const edited = overrideCount(state);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const revertAll = () => {
    dispatch({ type: "clearColorOverrides" });
    announce(`Reverted ${edited} ${edited === 1 ? "color" : "colors"}.`);
    headingRef.current?.focus();
  };

  return (
    <section aria-labelledby="palette-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2
          ref={headingRef}
          id="palette-heading"
          tabIndex={-1}
          className="flex items-center gap-2 font-display text-headline-sm"
        >
          <Palette aria-hidden size={20} />
          Color Palette Tokens
        </h2>
        <span data-testid="color-count" className="shrink-0 text-label-mono text-ink-muted">
          {COLOR_ROLES.length} Defined Tokens
        </span>
      </div>

      <p className="text-body-sm text-ink-muted">
        Edits apply live across the Playground, Components and every export, and stay on this
        device.
      </p>

      {edited > 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-control bg-subtle p-1.5 pl-2.5">
          <span data-testid="edited-count" className="text-label-md font-semibold">
            {edited} {edited === 1 ? "color" : "colors"} edited
          </span>
          <button
            type="button"
            onClick={revertAll}
            className="flex min-h-9 items-center gap-1.5 rounded-control bg-elevated px-3 text-label-md font-semibold shadow-rest transition-colors duration-150 hover:bg-muted"
          >
            <Undo2 aria-hidden size={14} />
            Revert all
          </button>
        </div>
      ) : null}

      <ul className="grid gap-1.5 lg:grid-cols-2">
        {rolesIn("core").map((role) => (
          <ColorRoleRow key={role} role={role} onCopy={onCopy} onRevert={announce} />
        ))}
      </ul>

      <h3 className="mt-1 text-label-mono tracking-wider text-ink-muted uppercase">Semantic States</h3>
      <ul className="grid gap-1.5 lg:grid-cols-3">
        {rolesIn("semantic").map((role) => (
          <ColorRoleRow key={role} role={role} onCopy={onCopy} onRevert={announce} />
        ))}
      </ul>
    </section>
  );
}
