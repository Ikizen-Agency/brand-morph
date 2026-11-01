"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** Inline navigation for tablet and desktop. Phones use BottomTabs. */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-9 items-center gap-1.5 rounded-control px-3 text-label-lg transition-colors duration-150 ${
              active ? "bg-subtle font-semibold text-ink" : "text-ink-muted hover:bg-subtle hover:text-ink"
            }`}
          >
            <Icon aria-hidden size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl md:hidden"
    >
      <ul className="flex h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-label-sm transition-colors duration-150 ${
                  active ? "text-ink" : "text-ink-muted"
                }`}
              >
                <Icon aria-hidden size={22} strokeWidth={active ? 2.25 : 1.75} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
