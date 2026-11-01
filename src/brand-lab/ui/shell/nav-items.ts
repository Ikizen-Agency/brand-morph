import { Braces, Shapes, SlidersHorizontal, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: "/" | "/components" | "/tokens";
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Playground", icon: SlidersHorizontal },
  { href: "/components", label: "Components", icon: Shapes },
  { href: "/tokens", label: "Tokens", icon: Braces },
];
