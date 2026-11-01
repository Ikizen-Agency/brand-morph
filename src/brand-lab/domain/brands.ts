export const BRAND_IDS = ["solace", "orbit", "lumen"] as const;
export type BrandId = (typeof BRAND_IDS)[number];

export const COLOR_ROLES = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "surface",
  "surfaceContainer",
  "onSurface",
  "muted",
  "border",
  "chrome",
  "success",
  "warning",
  "error",
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];
export type BrandColors = Record<ColorRole, string>;

export type FontRole = "sans" | "mono" | "serif";

export interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  alpha: number;
}

export interface BrandPillar {
  title: string;
  description: string;
  /** Semantic icon key. The UI maps it to a self-hosted icon. */
  icon: string;
}

export interface BrandStat {
  value: string;
  label: string;
}

/** What a sandbox secondary CTA reveals. */
export interface BrandDetailPanel {
  title: string;
  items: readonly [string, string, string];
}

export interface BrandCopy {
  subtext: string;
  url: string;
  logo: string;
  badge: string;
  headline: string;
  description: string;
  navCta: string;
  ctaPrimary: string;
  ctaSecondary: string;
  /** Replaces the primary CTA label once the visitor confirms it in the sandbox. */
  ctaConfirmed: string;
  confirmationDetail: string;
  detailPanel: BrandDetailPanel;
  heroTag: string;
  heroAlt: string;
  sectionLabel: string;
  pillars: readonly [BrandPillar, BrandPillar, BrandPillar];
  testimonial: string;
  author: string;
  rating: string;
  stats: readonly [BrandStat, BrandStat, BrandStat];
  footerHours: string;
  footerSupport: string;
}

export interface Brand {
  id: BrandId;
  name: string;
  colors: BrandColors;
  typography: { role: FontRole; heading: string; body: string };
  radii: { sm: string; md: string; lg: string; full: string };
  elevation: { elevation1: Shadow; elevation2: Shadow };
  copy: BrandCopy;
}

export const BRANDS: Record<BrandId, Brand> = {
  solace: {
    id: "solace",
    name: "Solace Health",
    colors: {
      primary: "#5E8271",
      onPrimary: "#0A0F0C",
      primaryContainer: "#EBF1ED",
      onPrimaryContainer: "#1D3328",
      secondary: "#D4A373",
      surface: "#F7F4EE",
      surfaceContainer: "#FFFFFF",
      onSurface: "#1D3328",
      muted: "#4A5D53",
      border: "#E2DBD0",
      chrome: "#EFECE5",
      success: "#3E7B5C",
      warning: "#D9822B",
      error: "#BA3C3C",
    },
    typography: {
      role: "sans",
      heading: "'Plus Jakarta Sans', sans-serif",
      body: "'Inter', sans-serif",
    },
    radii: { sm: "8px", md: "16px", lg: "24px", full: "9999px" },
    elevation: {
      elevation1: { x: 0, y: 2, blur: 8, spread: -2, color: "#1D3328", alpha: 0.06 },
      elevation2: { x: 0, y: 12, blur: 24, spread: -6, color: "#1D3328", alpha: 0.08 },
    },
    copy: {
      subtext: "Private Care & Wellness",
      url: "solacehealth.co/care",
      logo: "S",
      badge: "✨ Accepting new patient memberships",
      headline: "Care that fits your life, not the other way around.",
      description:
        "Private primary care, holistic clinical guidance, and thoughtful prevention tailored to your daily rhythm.",
      navCta: "Book Consult",
      ctaPrimary: "Book a consultation",
      ctaSecondary: "Meet our practitioners",
      ctaConfirmed: "Consultation requested",
      confirmationDetail: "A care coordinator would reach out within 15 minutes.",
      detailPanel: {
        title: "Your care team",
        items: [
          "Dr. Julian Vance, Clinical Director",
          "Dr. Mei Tanaka, Integrative Medicine",
          "Nora Ellis, Clinical Nutritionist",
        ],
      },
      heroTag: "Dr. Julian Vance • Clinical Director",
      heroAlt: "Sunlit wellness studio with linen textures, terracotta vessels and a fig tree",
      sectionLabel: "The Solace Difference",
      pillars: [
        {
          title: "Same-day Visits",
          description: "In-person clinic sanctuaries & encrypted 24/7 telehealth messaging.",
          icon: "calendar",
        },
        {
          title: "Whole-person Care",
          description: "Comprehensive labs, sleep architecture, clinical nutrition, & mental health.",
          icon: "psychology",
        },
        {
          title: "Transparent Pricing",
          description: "Flat monthly fee. Zero insurance copays or unexpected lab bills.",
          icon: "pricing",
        },
      ],
      testimonial:
        '"Solace changed how our entire family approaches health. No waiting rooms, just genuine warmth."',
      author: "Elena R. • Member since 2023",
      rating: "5.0 Verified Member",
      stats: [
        { value: "98%", label: "Satisfaction" },
        { value: "15 min", label: "Response" },
        { value: "12 MDs", label: "Board cert" },
      ],
      footerHours: "Clinical Hours: Mon-Sat 7:00am - 8:00pm PT",
      footerSupport: "24/7 Urgent Care Triage available via App",
    },
  },
  orbit: {
    id: "orbit",
    name: "Orbit Supply",
    colors: {
      primary: "#0047FF",
      onPrimary: "#CCFF00",
      primaryContainer: "#1E293B",
      onPrimaryContainer: "#FFFFFF",
      secondary: "#CCFF00",
      surface: "#111111",
      surfaceContainer: "#1F2421",
      onSurface: "#FFFFFF",
      muted: "#A1A1AA",
      border: "#3A3F3C",
      chrome: "#090E0B",
      success: "#4ADE80",
      warning: "#FBBF24",
      error: "#F87171",
    },
    typography: {
      role: "mono",
      heading: "'JetBrains Mono', ui-monospace, monospace",
      body: "'JetBrains Mono', ui-monospace, monospace",
    },
    radii: { sm: "0px", md: "0px", lg: "0px", full: "9999px" },
    elevation: {
      elevation1: { x: 0, y: 2, blur: 4, spread: 0, color: "#000000", alpha: 0.08 },
      elevation2: { x: 0, y: 8, blur: 16, spread: -2, color: "#000000", alpha: 0.12 },
    },
    copy: {
      subtext: "Everyday Commerce Engine",
      url: "orbitsupply.xyz/now",
      logo: "⚡",
      badge: "🚀 NEXT-DAY FREIGHT INCLUDED ON ALL ORDERS",
      headline: "Engineered essentials. Accelerated delivery.",
      description:
        "Ultra-durable tactical gear, modular EDC hardware, and raw materials built for high-output velocity.",
      navCta: "Quick Order",
      ctaPrimary: "Shop drop 04",
      ctaSecondary: "View specs manifest",
      ctaConfirmed: "Drop 04 reserved",
      confirmationDetail: "Your kit would be held for 15 minutes at the nearest hub.",
      detailPanel: {
        title: "SPECS MANIFEST",
        items: [
          "FRAME: GRADE 5 TITANIUM",
          "SHELL: 1000D CORDURA",
          "DISPATCH: UNDER 90 MINUTES",
        ],
      },
      heroTag: "DROP 04 • MODULAR EDC KIT",
      heroAlt: "Blueprint of an orbital hardware assembly on a technical grid",
      sectionLabel: "VELOCITY PROTOCOLS",
      pillars: [
        {
          title: "Zero Latency Fulfillment",
          description: "Autonomous micro-hubs dispatches your hardware under 90 minutes.",
          icon: "bolt",
        },
        {
          title: "Aerospace Grade",
          description: "Grade 5 titanium and 1000D Cordura certified for intense operational duty.",
          icon: "shield",
        },
        {
          title: "Infinite Warranty",
          description: "If you break it in the field, we replace it with zero questions asked.",
          icon: "verified",
        },
      ],
      testimonial:
        '"Orbit is industrial precision manifested as everyday tools. Shipping arrived before I even closed my laptop."',
      author: "Marcus K. • Tactical Engineer",
      rating: "4.99 INDUSTRIAL SPEC",
      stats: [
        { value: "99.4%", label: "ON-TIME DISPATCH" },
        { value: "44 min", label: "AVG DELIVERY" },
        { value: "48K+", label: "DEPLOYED UNITS" },
      ],
      footerHours: "GLOBAL DISPATCH HUBS ONLINE 24/7/365",
      footerSupport: "TACTICAL SUPPORT: SECURE TELETYPE LIVE",
    },
  },
  lumen: {
    id: "lumen",
    name: "Lumen Academy",
    colors: {
      primary: "#2B1E70",
      onPrimary: "#FFAE00",
      primaryContainer: "#E9E4F5",
      onPrimaryContainer: "#0E0926",
      secondary: "#FFAE00",
      surface: "#F3EEFF",
      surfaceContainer: "#FFFFFF",
      onSurface: "#0E0926",
      muted: "#4B4468",
      border: "#D9D0EC",
      chrome: "#E3DBF2",
      success: "#2E7D5B",
      warning: "#B45309",
      error: "#B42318",
    },
    typography: {
      role: "serif",
      heading: "'Source Serif 4', Georgia, serif",
      body: "'Source Serif 4', Georgia, serif",
    },
    radii: { sm: "6px", md: "12px", lg: "18px", full: "9999px" },
    elevation: {
      elevation1: { x: 0, y: 1, blur: 3, spread: 0, color: "#101828", alpha: 0.05 },
      elevation2: { x: 0, y: 6, blur: 14, spread: -2, color: "#101828", alpha: 0.07 },
    },
    copy: {
      subtext: "Professional Learning Platform",
      url: "lumen.edu/fellowships",
      logo: "L",
      badge: "🎓 Autumn Fellowships Now Open for Admissions",
      headline: "Mastercraft pedagogy for visionary minds.",
      description:
        "Socratic seminars, hands-on architectural design studios, and direct mentorship from world-class industry leads.",
      navCta: "Admissions",
      ctaPrimary: "Apply for Fellowship",
      ctaSecondary: "Explore Curriculum",
      ctaConfirmed: "Application started",
      confirmationDetail: "Your fellowship draft would be saved for the admissions team.",
      detailPanel: {
        title: "Autumn curriculum",
        items: [
          "Socratic Seminar in Systems Thinking",
          "Architectural Design Studio",
          "Mentored Capstone Critique",
        ],
      },
      heroTag: "Prof. Iris Okafor • Dean of Studios",
      heroAlt: "Illustrated arcade of tall arched windows lit by a low amber sun",
      sectionLabel: "The Lumen Pedagogy",
      pillars: [
        {
          title: "Intimate Cohorts",
          description: "Max 12 fellows per masterclass to guarantee rigorous critique and growth.",
          icon: "groups",
        },
        {
          title: "Practitioner Led",
          description: "Taught exclusively by active leaders currently shipping seminal systems.",
          icon: "school",
        },
        {
          title: "Enduring Network",
          description: "Lifelong access to private alumni salons, dinners, and syndicate funds.",
          icon: "hub",
        },
      ],
      testimonial:
        '"The depth of discourse at Lumen is unmatched. It fundamentally rewired how I architect organizations."',
      author: "Dr. Amara S. • Staff Architect",
      rating: "99 NPS Cohort Score",
      stats: [
        { value: "94%", label: "Grad Placement" },
        { value: "1 : 6", label: "Faculty Ratio" },
        { value: "350+", label: "Global Alumni" },
      ],
      footerHours: "Dean's Office Hours: Tue-Fri 10:00am - 4:00pm EST",
      footerSupport: "Admissions Concierge: admissions@lumen.edu",
    },
  },
};
