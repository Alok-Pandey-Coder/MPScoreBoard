'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitCompare, Info, Map, Menu, Search, X, type LucideIcon } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageToggle } from '../common/LanguageToggle';
import { useMessages } from '@/context/LanguageContext';
import { commonMessages } from '@/lib/messages/common';

type CommonText = (typeof commonMessages)['en'];

interface NavItem {
  href: string;
  label: keyof CommonText;
  icon: LucideIcon;
  /** Extra context shown as a tooltip and in the mobile menu. */
  hint: keyof CommonText;
}

// One list drives both the desktop bar and the mobile menu.
const NAV: NavItem[] = [
  { href: '/', label: 'navFind', icon: Search, hint: 'navFindHint' },
  { href: '/compare', label: 'navCompare', icon: GitCompare, hint: 'navCompareHint' },
  { href: '/explore', label: 'navMap', icon: Map, hint: 'navMapHint' },
  { href: '/about', label: 'navAbout', icon: Info, hint: 'navAboutHint' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useMessages(commonMessages);

  // Report cards (/mp/...) belong to "Find your MP".
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/mp/') : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-[#F9F9F7]/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#1E2636] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group min-w-0" aria-label={t.homeAria}>
            <div className="w-14 h-9 sm:w-16 sm:h-10 shrink-0 rounded-xl bg-[#F5E6D3] border border-amber-500/25 dark:border-amber-500/30 flex items-center justify-center shadow-sm transition-transform group-hover:scale-[1.02] overflow-hidden p-1">
              <img
                src="/icon.png"
                alt={t.brandName}
                width={64}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 dark:text-stone-100 tracking-tight text-lg sm:text-[1.2rem] font-sans">
                  {t.brandName}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
                  {t.termBadge}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block truncate">
                {t.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label={t.navMain} className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label: labelKey, icon: Icon, hint: hintKey }) => {
              const label = t[labelKey];
              const hint = t[hintKey];
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
            <div className="pl-2 ml-1 border-l border-stone-200 dark:border-[#222E42] flex items-center gap-1.5">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageToggle className="px-2.5" />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="w-11 h-11 flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#141B28]"
              aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
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
            aria-label={t.navMain}
            className="md:hidden py-3 border-t border-stone-200 dark:border-[#1E2636]"
          >
            <ul className="flex flex-col gap-1 pb-2">
              {NAV.map(({ href, label: labelKey, icon: Icon, hint: hintKey }) => {
              const label = t[labelKey];
              const hint = t[hintKey];
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
                        <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{hint}</span>
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
