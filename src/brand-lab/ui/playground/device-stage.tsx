"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DEVICE_WIDTH, type Device } from "../../domain/tuning";

const CHASSIS_PADDING = 10;

const DEVICE_LABEL: Record<Device, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

interface Measured {
  available: number;
  height: number;
}

/**
 * Renders the sandbox at its real device width, so container queries see that width, then scales
 * it down to fit. A transform never affects layout, which keeps the reflow honest on any screen.
 */
export function DeviceStage({
  device,
  visible,
  children,
}: Readonly<{ device: Device; visible: boolean; children: ReactNode }>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return;
    const observer = new ResizeObserver(() => {
      setMeasured({ available: stage.clientWidth, height: frame.offsetHeight });
    });
    observer.observe(stage);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const width = DEVICE_WIDTH[device];
  const outerWidth = width + CHASSIS_PADDING * 2;
  const scale = measured ? Math.min(1, measured.available / outerWidth) : 1;
  const percent = Math.round(scale * 100);

  return (
    <section aria-labelledby="sandbox-heading" className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="sandbox-heading" className="flex items-center gap-1.5 text-label-mono font-semibold tracking-wider uppercase">
          <span aria-hidden className="size-2 rounded-full bg-emerald-600" />
          Morph Sandbox
        </h2>
        <p data-testid="viewport-pill" className="text-label-mono text-ink-muted">
          {DEVICE_LABEL[device]} {width}px{percent < 100 ? ` at ${percent}%` : ""}
        </p>
      </div>
      <div
        ref={stageRef}
        className="relative overflow-hidden transition-[height] duration-300"
        style={{ height: measured ? measured.height * scale : undefined, minHeight: measured ? undefined : 640 }}
      >
        <div
          ref={frameRef}
          data-testid="device-frame"
          className="absolute top-0 left-1/2 origin-top rounded-[2rem] bg-muted p-2.5 shadow-float transition-[width,opacity] duration-300"
          style={{
            width: outerWidth,
            translate: "-50% 0",
            scale: String(scale),
            opacity: visible && measured ? 1 : 0,
          }}
        >
          <div className="overflow-hidden rounded-[1.5rem]">{children}</div>
        </div>
      </div>
    </section>
  );
}
