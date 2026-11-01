/**
 * The export only ships a Solace photo. These treatments draw the other heroes from scope
 * variables, so they follow the active tokens, including color overrides.
 */
export function OrbitHeroArt() {
  return (
    <svg aria-hidden viewBox="0 0 512 280" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <pattern id="orbit-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="var(--sb-color-border)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="512" height="280" fill="var(--sb-color-surface-container)" />
      <rect width="512" height="280" fill="url(#orbit-grid)" />
      <g fill="none" stroke="var(--sb-color-primary)" strokeWidth="2">
        <ellipse cx="256" cy="140" rx="210" ry="74" transform="rotate(-14 256 140)" />
        <ellipse cx="256" cy="140" rx="150" ry="52" transform="rotate(-14 256 140)" />
      </g>
      <path
        d="M256 84l48 28v56l-48 28-48-28v-56z"
        fill="var(--sb-color-primary)"
        stroke="var(--sb-color-secondary)"
        strokeWidth="2"
      />
      <circle cx="256" cy="140" r="16" fill="var(--sb-color-surface)" stroke="var(--sb-color-secondary)" strokeWidth="2" />
      <circle cx="456" cy="88" r="8" fill="var(--sb-color-secondary)" />
      <circle cx="86" cy="196" r="5" fill="var(--sb-color-secondary)" />
    </svg>
  );
}

const ARCH_XS = [28, 124, 220, 316, 412];

export function LumenHeroArt() {
  return (
    <svg aria-hidden viewBox="0 0 512 280" preserveAspectRatio="xMidYMid slice" className="size-full">
      <rect width="512" height="280" fill="var(--sb-color-primary)" />
      <circle cx="256" cy="196" r="92" fill="var(--sb-color-secondary)" />
      <rect y="232" width="512" height="48" fill="var(--sb-color-on-primary-container)" fillOpacity="0.45" />
      {ARCH_XS.map((x) => (
        <path
          key={x}
          d={`M${x} 280V104a36 36 0 0 1 72 0v176z`}
          fill="var(--sb-color-primary-container)"
          fillOpacity="0.16"
          stroke="var(--sb-color-primary-container)"
          strokeWidth="2"
        />
      ))}
      <path d="M0 40h512" stroke="var(--sb-color-primary-container)" strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  );
}
