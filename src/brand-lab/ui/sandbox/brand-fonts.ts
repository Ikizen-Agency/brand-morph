import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

/** Applied to a brand scope root only, so these faces can never reach the studio chrome. */
export const brandFontClasses = `${jetBrainsMono.variable} ${sourceSerif.variable}`;
