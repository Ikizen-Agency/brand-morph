/** WCAG 2.2 AA minimum for normal size text. */
export const AA_NORMAL_TEXT = 4.5;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

export function hexToRgb(hex: string): [number, number, number] {
  if (!isHexColor(hex)) {
    throw new Error(`Expected a six digit hex color, received: ${hex}`);
  }
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map(linearize);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export interface ContrastCheck {
  /** Rounded down to two decimals, so a failing ratio never displays as a pass. */
  ratio: number;
  passesAA: boolean;
}

export function checkContrast(foreground: string, background: string): ContrastCheck {
  const ratio = contrastRatio(foreground, background);
  return {
    // The epsilon absorbs float noise such as 20.999999999999996 for black on white.
    ratio: Math.floor(ratio * 100 + 1e-9) / 100,
    passesAA: ratio >= AA_NORMAL_TEXT,
  };
}
