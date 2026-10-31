'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, GitCompare, HelpCircle, Menu, X, Search } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg sm:text-xl font-['Outfit']">
                  Mera MP, Mera Report Card
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200/80 dark:border-blue-800/60">
                  18th Lok Sabha
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Transparent &amp; Neutral Citizen Dashboard
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3.5 py-1.5 mr-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700/80"
              >
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Search MP or seat...</span>
                <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                  /
                </kbd>
              </button>
            )}

            <Link href="/"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              Explore MPs
            </Link>

            <Link href="/compare"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/compare')
                  ? 'text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare</span>
            </Link>

            <Link href="/about"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-blue-700 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Methodology</span>
            </Link>

            {/* Theme Toggle Button */}
            <div className="pl-1">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 pb-2">
              <Link href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-base font-medium ${
                  isActive('/')
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Explore MPs
              </Link>
              <Link href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-medium ${
                  isActive('/compare')
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <GitCompare className="w-5 h-5" />
                Compare MPs
              </Link>
              <Link href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-medium ${
                  isActive('/about')
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                Methodology &amp; Sources
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
