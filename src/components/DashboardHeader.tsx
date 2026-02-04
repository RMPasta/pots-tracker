'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppLogo } from '@/components/AppLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export type HeaderLink = { href: string; label: string };

type DashboardHeaderProps = {
  links: HeaderLink[];
  signOutSlot?: React.ReactNode;
  signOutSlotMobile?: React.ReactNode;
};

export function DashboardHeader({ links, signOutSlot, signOutSlotMobile }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex min-h-[88px] items-center justify-between rounded-2xl bg-card-bg px-3 py-4 shadow-(--shadow-soft) sm:px-4 sm:py-5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <AppLogo size="header" />
      </div>

      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-card-bg shadow-(--shadow-soft) transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pastel-outline-pink/50"
      >
        {menuOpen ? (
          <svg
            className="h-6 w-6 text-foreground-soft"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-foreground-soft"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-3 top-full z-50 mt-2 flex w-[min(calc(100vw-1.5rem),16rem)] flex-col gap-2 rounded-2xl bg-card-bg p-3 shadow-(--shadow-soft)">
            <ThemeToggle />
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex w-full items-center justify-center rounded-full bg-btn-primary px-4 py-3 text-center text-sm font-medium text-foreground-soft transition-colors hover:bg-btn-primary-hover"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="w-full">{signOutSlotMobile ?? signOutSlot}</div>
          </div>
        </>
      )}
    </header>
  );
}
