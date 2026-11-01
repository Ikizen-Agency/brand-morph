import { BookOpen, Flower2, Zap, type LucideIcon } from "lucide-react";
import type { BrandId } from "../domain/brands";

export const BRAND_ICONS: Record<BrandId, LucideIcon> = {
  solace: Flower2,
  orbit: Zap,
  lumen: BookOpen,
};
