"use client";

import { CopyCheck, Download, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { EXPORT_FORMATS, exportTokens, type ExportFormat } from "../../domain/exporters";
import { Segmented, type SegmentedOption } from "../controls/segmented";
import { downloadFile } from "../download-file";
import { useLab } from "../lab-provider";
import type { Announce } from "../use-announcer";
import type { CopyToken } from "./use-token-copy";

type FormatId = ExportFormat["id"];

const FORMAT_OPTIONS: ReadonlyArray<SegmentedOption<FormatId>> = EXPORT_FORMATS.map(
  ({ id, label }) => ({ value: id, label }),
);

const formatById = (id: FormatId) =>
  EXPORT_FORMATS.find((format) => format.id === id) ?? EXPORT_FORMATS[0];

export function ExportPanel({
  onCopy,
  announce,
}: Readonly<{ onCopy: CopyToken; announce: Announce }>) {
  const { state, tokens } = useLab();
  const [formatId, setFormatId] = useState<FormatId>("css");
  const format = formatById(formatId);
  const fileName = format.fileName(state.brandId);
  const output = exportTokens(tokens, format.id);

  const download = () => {
    downloadFile(fileName, format.mimeType, output);
    announce(`Download requested: ${fileName}.`);
  };

  return (
    <section aria-labelledby="export-heading" className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id="export-heading" className="flex items-center gap-2 font-display text-headline-sm">
          <SquareTerminal aria-hidden size={20} />
          Export Architecture
        </h2>
        <span data-testid="export-size" className="shrink-0 text-label-mono text-ink-muted">
          {output.split("\n").length - 1} lines
        </span>
      </div>

      <Segmented
        legend="Export format"
        hideLegend
        name="export-format"
        value={formatId}
        options={FORMAT_OPTIONS}
        onChange={setFormatId}
      />

      <div className="flex min-w-0 flex-col rounded-enclosure bg-ink p-3 text-[#dfe4df] shadow-rest">
        <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2">
          <span data-testid="export-file" className="min-w-0 truncate font-mono text-[11px]">
            {fileName}
          </span>
          <span className="shrink-0 font-mono text-[10px] tracking-wider text-[#adb3ad]">READ-ONLY</span>
        </div>
        <pre
          data-testid="export-output"
          tabIndex={0}
          aria-label={`Generated ${format.label} tokens`}
          className="mt-2 max-h-96 overflow-auto font-mono text-[11px] leading-[18px] focus-visible:outline-canvas xl:max-h-[calc(100dvh-30rem)]"
        >
          {output}
        </pre>
      </div>

      <button
        type="button"
        onClick={() => onCopy(output, `${format.label} tokens`)}
        className="flex min-h-11 items-center justify-center gap-2 rounded-enclosure bg-ink px-4 text-label-lg font-semibold text-canvas transition-colors duration-150 hover:bg-[#2e3632]"
      >
        <CopyCheck aria-hidden size={18} />
        Copy Tokens to Clipboard
      </button>
      <button
        type="button"
        onClick={download}
        className="flex min-h-11 items-center justify-center gap-2 rounded-enclosure bg-muted px-4 text-label-lg font-semibold transition-colors duration-150 hover:bg-line"
      >
        <Download aria-hidden size={18} />
        Download {fileName}
      </button>
    </section>
  );
}
