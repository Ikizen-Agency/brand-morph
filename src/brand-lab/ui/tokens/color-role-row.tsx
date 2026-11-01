"use client";

import { CircleAlert, CircleCheck, CircleMinus, Copy, Undo2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  colorDeclaration,
  colorVariable,
  COLOR_ROLE_META,
  isRoleOverridden,
  parseHexInput,
} from "../../application/token-inspector";
import { BRANDS, type ColorRole } from "../../domain/brands";
import { kebab } from "../../domain/exporters";
import { roleContrast, type RoleContrast } from "../../domain/tokens";
import { useLab } from "../lab-provider";
import { useScopedState } from "../use-scoped-state";
import type { CopyToken } from "./use-token-copy";

interface ColorRoleRowProps {
  role: ColorRole;
  onCopy: CopyToken;
  onRevert: (text: string) => void;
}

const VERDICTS = {
  pass: { label: "Passes AA", Icon: CircleCheck },
  fail: { label: "Fails AA", Icon: CircleAlert },
  none: { label: "No AA target", Icon: CircleMinus },
};

const verdictOf = ({ hasTarget, passesAA }: RoleContrast) =>
  !hasTarget ? VERDICTS.none : passesAA ? VERDICTS.pass : VERDICTS.fail;

function ContrastVerdict({ check }: Readonly<{ check: RoleContrast }>) {
  const { label, Icon } = verdictOf(check);
  return (
    <p data-testid="contrast" className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-label-md">
      <span className="flex items-center gap-1 font-semibold">
        <Icon aria-hidden size={14} />
        {label}
      </span>
      <span className="font-mono text-ink-muted">{check.ratio.toFixed(2)}:1</span>
      <span className="text-ink-muted">
        {kebab(check.foreground)} on {kebab(check.background)}
      </span>
    </p>
  );
}

const iconButton =
  "flex size-9 shrink-0 items-center justify-center rounded-control bg-subtle text-ink-muted transition-colors duration-150 hover:bg-muted hover:text-ink";

export function ColorRoleRow({ role, onCopy, onRevert }: Readonly<ColorRoleRowProps>) {
  const { state, tokens, resets, dispatch } = useLab();
  const value = tokens.colors[role];
  const variable = colorVariable(role);
  const overridden = isRoleOverridden(state, role);
  const hexRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  const [draft, setDraft] = useScopedState(`${state.brandId}:${resets}:${value}`, () => value);
  const [typing, setTyping] = useState(false);
  const invalid = parseHexInput(draft) === null;
  const showError = invalid && !typing;

  const edit = (next: string) => {
    setDraft(next);
    const hex = parseHexInput(next);
    if (hex) dispatch({ type: "setColorOverride", role, hex });
  };

  const revert = () => {
    dispatch({ type: "clearColorOverride", role });
    onRevert(`Reverted ${variable} to ${BRANDS[state.brandId].colors[role]}.`);
    hexRef.current?.focus();
  };

  return (
    <li
      data-testid={`role-${role}`}
      data-overridden={overridden}
      className="flex flex-col gap-2 rounded-enclosure border border-line bg-elevated p-2.5 shadow-rest"
    >
      <div className="flex items-center gap-2.5">
        <input
          type="color"
          aria-label={`Pick ${variable}`}
          value={value.toLowerCase()}
          onChange={(event) => edit(event.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-control border border-line-strong bg-transparent p-0 [&::-moz-color-swatch]:rounded-[7px] [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-[7px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-label-mono break-words">{variable}</p>
          <p className="text-body-sm text-ink-muted">
            {COLOR_ROLE_META[role].usage}
            {overridden ? <span className="font-semibold text-ink"> · Edited</span> : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <input
          ref={hexRef}
          type="text"
          aria-label={`${variable} hex value`}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          autoComplete="off"
          spellCheck={false}
          value={draft}
          onChange={(event) => edit(event.target.value)}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") setTyping(false);
            if (event.key === "Escape") {
              setDraft(value);
              setTyping(false);
            }
          }}
          className="h-9 min-w-0 flex-1 rounded-control border border-line bg-subtle px-2 font-mono text-[12px] text-ink shadow-well aria-invalid:border-ink"
        />
        <button
          type="button"
          aria-label={`Copy ${variable}`}
          onClick={() => onCopy(colorDeclaration(tokens, role), variable)}
          className={iconButton}
        >
          <Copy aria-hidden size={15} />
        </button>
        {overridden ? (
          <button type="button" aria-label={`Revert ${variable}`} onClick={revert} className={iconButton}>
            <Undo2 aria-hidden size={15} />
          </button>
        ) : null}
      </div>

      {showError ? (
        <p id={errorId} className="flex items-center gap-1 text-label-md font-semibold">
          <CircleAlert aria-hidden size={14} />
          Use six hex digits, such as {BRANDS[state.brandId].colors[role]}.
        </p>
      ) : null}

      <ContrastVerdict check={roleContrast(tokens.colors, role)} />
    </li>
  );
}
