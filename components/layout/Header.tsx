'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitCompare, HelpCircle, Menu, X, Search, Compass, MapPin } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F9F9F7]/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#1E2636] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo & Authentic Editorial Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* Architectural Sansad Mark */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 dark:bg-[#151D2A] border border-stone-700/40 dark:border-[#2C384D] flex items-center justify-center text-amber-500 shadow-sm transition-transform group-hover:scale-[1.02]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-amber-500"
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
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 dark:text-stone-100 tracking-tight text-lg sm:text-[1.2rem] font-sans">
                  Mera MP
                </span>
                <span className="text-stone-400 dark:text-stone-600 font-light hidden sm:inline">|</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
                  18th Lok Sabha
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block tracking-wide">
                Delhi Parliamentary Scrutiny &amp; Expenditure Monitor
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 mr-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-[#121824] hover:bg-stone-200/80 dark:hover:bg-[#192233] rounded-lg transition-colors border border-stone-200 dark:border-[#222E42]"
              >
                <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                <span>Search seat or MP...</span>
                <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#0A0E17] text-stone-500 dark:text-stone-400 rounded border border-stone-300 dark:border-[#2E3C54]">
                  /
                </kbd>
              </button>
            )}

            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                isActive('/')
                  ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333] border border-stone-300/80 dark:border-[#2C384D]'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141B28]'
              }`}
            >
              Delhi Seats
            </Link>

            <Link
              href="/compare"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                isActive('/compare')
                  ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333] border border-stone-300/80 dark:border-[#2C384D]'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141B28]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare</span>
            </Link>

            <Link
              href="/explore"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                isActive('/explore')
                  ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333] border border-stone-300/80 dark:border-[#2C384D]'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141B28]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>All-India Atlas</span>
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                isActive('/about')
                  ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333] border border-stone-300/80 dark:border-[#2C384D]'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#141B28]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Sources &amp; Method</span>
            </Link>

            {/* Theme Toggle Button */}
            <div className="pl-2 border-l border-stone-200 dark:border-[#222E42] ml-1">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#141B28]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#141B28]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-200 dark:border-[#1E2636] animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 pb-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/')
                    ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                Delhi Seats &amp; Map
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/compare')
                    ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                Compare MPs
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/explore')
                    ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <Compass className="w-4 h-4" />
                All-India Atlas
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold ${
                  isActive('/about')
                    ? 'text-stone-900 dark:text-white bg-stone-200/80 dark:bg-[#1A2333]'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Methodology &amp; Sources
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
