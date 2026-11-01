"use client";

import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Replaces the visible label, which then stays available to assistive technology. */
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  legend: string;
  hideLegend?: boolean;
  name: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
}

/** Native radios, so arrow keys, form semantics and focus come from the platform. */
export function Segmented<T extends string>({
  legend,
  hideLegend = false,
  name,
  value,
  options,
  onChange,
}: Readonly<SegmentedProps<T>>) {
  return (
    <fieldset className="min-w-0">
      <legend className={hideLegend ? "sr-only" : "mb-1 text-label-sm text-ink-muted"}>
        {legend}
      </legend>
      <div className="flex gap-0.5 rounded-control bg-subtle p-0.5 shadow-well">
        {options.map((option) => (
          <label key={option.value} className="min-w-0 flex-1 cursor-pointer">
            <input
              type="radio"
              className="peer sr-only"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="flex min-h-9 items-center justify-center rounded-[6px] px-1 text-label-md text-ink-muted transition-colors duration-150 peer-checked:bg-elevated peer-checked:font-semibold peer-checked:text-ink peer-checked:shadow-rest peer-focus-visible:outline-2 peer-focus-visible:outline-ink hover:text-ink">
              {option.icon ? (
                <>
                  {option.icon}
                  <span className="sr-only">{option.label}</span>
                </>
              ) : (
                option.label
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
