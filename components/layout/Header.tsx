'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitCompare, Info, Map, Menu, Search, X, type LucideIcon } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra context shown as a tooltip and to screen readers. */
  hint?: string;
}

// One list drives both the desktop bar and the mobile menu.
const NAV: NavItem[] = [
  { href: '/', label: 'Find your MP', icon: Search, hint: 'Search by your area, constituency or MP name' },
  { href: '/compare', label: 'Compare MPs', icon: GitCompare, hint: 'See two MPs side by side' },
  { href: '/explore', label: 'Map', icon: Map, hint: 'Map of Lok Sabha constituencies; report cards are being added state by state' },
  { href: '/about', label: 'About the data', icon: Info, hint: 'Where the data comes from, what it means and its limits' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Report cards (/mp/...) belong to "Find your MP".
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/mp/') : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-[#F9F9F7]/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#1E2636] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group min-w-0" aria-label="Mera MP, home">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-stone-900 dark:bg-[#151D2A] border border-stone-700/40 dark:border-[#2C384D] flex items-center justify-center shadow-sm transition-transform group-hover:scale-[1.02]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-amber-500"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M4 18h16" />
                <path d="M6 18v-7" />
                <path d="M10 18v-7" />
                <path d="M14 18v-7" />
                <path d="M18 18v-7" />
                <path d="M12 2l8 5H4l8-5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 dark:text-stone-100 tracking-tight text-lg sm:text-[1.2rem] font-sans">
                  Mera MP
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
                  Lok Sabha 2024–29
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block truncate">
                Lok Sabha MP report cards, with sources
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon, hint }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={hint}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141B28]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
            <div className="pl-2 ml-1 border-l border-stone-200 dark:border-[#222E42]">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="w-11 h-11 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#141B28]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Main"
            className="md:hidden py-3 border-t border-stone-200 dark:border-[#1E2636]"
          >
            <ul className="flex flex-col gap-1 pb-2">
              {NAV.map(({ href, label, icon: Icon, hint }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-start gap-3 px-3.5 py-2.5 min-h-11 rounded-lg ${
                        active
                          ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#141B28]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-semibold">{label}</span>
                        {hint && <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{hint}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};
