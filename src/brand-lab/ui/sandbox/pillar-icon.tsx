import {
  BadgeCheck,
  Brain,
  CalendarDays,
  CreditCard,
  GraduationCap,
  Network,
  Shield,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const PILLAR_ICONS: Record<string, LucideIcon> = {
  calendar: CalendarDays,
  psychology: Brain,
  pricing: CreditCard,
  bolt: Zap,
  shield: Shield,
  verified: BadgeCheck,
  groups: Users,
  school: GraduationCap,
  hub: Network,
};

export function PillarIcon({ name }: Readonly<{ name: string }>) {
  const Icon = PILLAR_ICONS[name] ?? Sparkles;
  return <Icon aria-hidden size={18} />;
}
