'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import { useMessages } from '@/context/LanguageContext';
import { commonMessages } from '@/lib/messages/common';
import snapshotData from '@/data/processed/snapshot.json';

// Source names are proper names and are shown as published in both languages.
const SOURCES = [
  { href: 'https://sansad.in/ls', name: 'Lok Sabha (Digital Sansad)' },
  { href: 'https://prsindia.org', name: 'PRS Legislative Research' },
  { href: 'https://www.myneta.info', name: 'ADR / MyNeta' },
  { href: 'https://affidavit.eci.gov.in', name: 'Election Commission of India (ECI)' },
  { href: 'https://www.mplads.mospi.gov.in', name: 'MoSPI eSAKSHI (MPLADS) via Empowered Indian' },
];

export const Footer: React.FC = () => {
  const t = useMessages(commonMessages);
  const explore = [
    { href: '/', label: t.navFind },
    { href: '/compare', label: t.navCompare },
    { href: '/explore', label: t.navMap },
    { href: '/about', label: t.navAbout },
    { href: '/about#minister-policy', label: t.footerMinisters },
  ];

  return (
    <footer className="bg-stone-100 dark:bg-[#070A10] text-stone-600 dark:text-stone-400 border-t border-stone-200 dark:border-[#1A2230] mt-20 pt-12 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 dark:text-white text-lg tracking-tight font-sans">
                {t.brandFull}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-[#151D2A] text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-[#222E42]">
                {t.termBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg leading-relaxed">{t.footerAbout}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 pt-1">
              <span className="flex items-center gap-1.5 bg-stone-200/70 dark:bg-[#121A26] px-2.5 py-1 rounded border border-stone-300/80 dark:border-[#1E293B]">
                {t.footerSnapshot}: {snapshotData.snapshot_version}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.footerGenerated} {String(snapshotData.generated_at).slice(0, 10)}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              {t.footerSourcesHeading}
            </h2>
            <ul className="space-y-2 text-xs font-mono">
              {SOURCES.map((src) => (
                <li key={src.href}>
                  <a
                    href={src.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{src.name}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" aria-hidden="true" />
                    <span className="sr-only">{t.opensInNewTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              {t.footerExploreHeading}
            </h2>
            <ul className="space-y-2 text-xs">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-stone-900 dark:hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 dark:border-[#1A2230] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-stone-500 dark:text-stone-400">
          <div className="text-center sm:text-left leading-relaxed max-w-3xl space-y-1.5">
            <p>{t.footerDisclaimer}</p>
            <p>{t.footerAttribution}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              {t.footerReportIssue}
            </a>
            <span aria-hidden="true">·</span>
            <Link href="/about" className="hover:underline">
              {t.footerMethodology}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
