"use client";

import { Laptop, Smartphone, SlidersHorizontal, Tablet, WandSparkles } from "lucide-react";
import type { CtaShape, Density, Device, RadiusScale } from "../../domain/tuning";
import { Segmented, type SegmentedOption } from "../controls/segmented";
import { useLab } from "../lab-provider";

const DEVICE_OPTIONS: ReadonlyArray<SegmentedOption<Device>> = [
  { value: "desktop", label: "Desktop", icon: <Laptop aria-hidden size={16} /> },
  { value: "tablet", label: "Tablet", icon: <Tablet aria-hidden size={16} /> },
  { value: "mobile", label: "Mobile", icon: <Smartphone aria-hidden size={16} /> },
];

const DENSITY_OPTIONS: ReadonlyArray<SegmentedOption<Density>> = [
  { value: "comfortable", label: "Comfort" },
  { value: "compact", label: "Compact" },
];

const RADIUS_OPTIONS: ReadonlyArray<SegmentedOption<RadiusScale>> = [
  { value: "24px", label: "r-24" },
  { value: "12px", label: "r-12" },
  { value: "0px", label: "r-0" },
];

const CTA_OPTIONS: ReadonlyArray<SegmentedOption<CtaShape>> = [
  { value: "pill", label: "Pill" },
  { value: "sharp", label: "Sharp" },
  { value: "block", label: "Block" },
];

export function TuningRack() {
  const { state, dispatch } = useLab();
  const { density, radius, cta } = state.tuning;

  return (
    <section
      aria-labelledby="rack-heading"
      className="flex flex-col gap-3.5 rounded-enclosure border border-line bg-subtle/60 p-3.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <h2 id="rack-heading" className="flex items-center gap-1.5 text-label-mono font-semibold whitespace-nowrap uppercase">
          <SlidersHorizontal aria-hidden size={15} />
          Morph Tuning Rack
        </h2>
        <button
          type="button"
          onClick={() => dispatch({ type: "autoMatch" })}
          className="flex min-h-9 items-center gap-1 rounded-control px-1.5 text-label-md whitespace-nowrap text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink"
        >
          <WandSparkles aria-hidden size={14} />
          Auto-match
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 md:grid-cols-4 lg:grid-cols-1">
        <Segmented
          legend="Simulation Stage"
          name="device"
          value={state.device}
          options={DEVICE_OPTIONS}
          onChange={(device) => dispatch({ type: "setDevice", device })}
        />
        <Segmented
          legend="Rhythm Density"
          name="density"
          value={density}
          options={DENSITY_OPTIONS}
          onChange={(next) => dispatch({ type: "setDensity", density: next })}
        />
        <Segmented
          legend="Geometry / Radius"
          name="radius"
          value={radius}
          options={RADIUS_OPTIONS}
          onChange={(next) => dispatch({ type: "setRadius", radius: next })}
        />
        <Segmented
          legend="CTA Silhouette"
          name="cta"
          value={cta}
          options={CTA_OPTIONS}
          onChange={(next) => dispatch({ type: "setCta", cta: next })}
        />
      </div>
    </section>
  );
}
