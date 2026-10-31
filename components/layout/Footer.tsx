import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import snapshotData from '@/data/processed/snapshot.json';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 dark:bg-[#070a12] text-slate-300 dark:text-slate-400 border-t border-slate-800 dark:border-slate-800/80 mt-20 pt-12 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About Project */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-extrabold text-white text-lg tracking-tight font-['Outfit']">
                Mera MP, Mera Report Card
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-800 text-slate-300 border border-slate-700">
                MVP v1.0
              </span>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-400 mb-4 max-w-lg leading-relaxed">
              An open, neutral, citizen-facing portal providing traceable, sourced records of parliamentary activity, local constituency development funds (MPLADS), and sworn affidavit filings for Members of Parliament in the 18th Lok Sabha.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Snapshot: {snapshotData.snapshot_version}
              </span>
              <span>7 Delhi Parliamentary Constituencies</span>
            </div>
          </div>

          {/* Col 2: Public Sources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-slate-200 mb-3 font-['Outfit']">
              Data Provenance
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://sansad.in/ls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Lok Sabha (Digital Sansad)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://prsindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>PRS Legislative Research</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://delhi.gov.in/members-of-parliament"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Govt of NCT of Delhi</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://affidavit.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Election Commission of India</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Transparency */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-slate-200 mb-3 font-['Outfit']">
              Transparency
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Methodology &amp; Definitions
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare MPs Side-by-Side
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <GitHubIcon className="w-3.5 h-3.5" />
                  <span>Report Data Issue / GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Non-partisan Disclaimer Box */}
        <div className="bg-slate-950/80 dark:bg-slate-950/90 border border-slate-800 dark:border-slate-800/90 rounded-2xl p-4.5 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 dark:text-slate-400 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-300 dark:text-slate-200">
                Official Civic &amp; Non-Affiliation Disclaimer
              </p>
              <p>
                This is an independent, non-partisan civic technology project created for academic and citizen transparency purposes. It is not affiliated with, authorized, or endorsed by the Parliament of India, the Election Commission of India, PRS Legislative Research, ADR, or any political party.
              </p>
              <p>
                Parliamentary activity indicators show quantitative participation, not the qualitative merit or total impact of an MP&apos;s service. Declared affidavit information reflects candidates&apos; sworn pre-election disclosures, not criminal convictions.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-1">
            <span>Built for citizen empowerment at</span>
            <span className="font-semibold text-slate-400">hackCBS 9.0</span>
          </div>
          <div>
            <span>Data captured strictly from immutable public snapshots</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
