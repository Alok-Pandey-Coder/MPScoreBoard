import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, Scale, FileText } from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import snapshotData from '@/data/processed/snapshot.json';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-100 dark:bg-[#070A10] text-stone-600 dark:text-stone-400 border-t border-stone-200 dark:border-[#1A2230] mt-20 pt-12 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 & 2: Publication Masthead & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 dark:text-white text-lg tracking-tight font-sans">
                Mera MP, Mera Report Card
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-[#151D2A] text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-[#222E42]">
                18th Lok Sabha
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-lg leading-relaxed">
              An open, source-verified citizen public ledger providing traceable records of parliamentary attendance, floor questions, local development fund allocations (MPLADS), and sworn affidavit disclosures for Members of Parliament.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 pt-1">
              <span className="flex items-center gap-1.5 bg-stone-200/70 dark:bg-[#121A26] px-2.5 py-1 rounded border border-stone-300/80 dark:border-[#1E293B]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Snapshot: {snapshotData.snapshot_version}
              </span>
              <span>·</span>
              <span>7 Delhi Seats (100% Sourced)</span>
            </div>
          </div>

          {/* Col 3: Primary Government & Official Provenance */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              Primary Data Provenance
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href="https://sansad.in/ls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Lok Sabha (Digital Sansad)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://prsindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>PRS Legislative Research</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://affidavit.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Election Commission of India (ECI)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://mplads.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Ministry of Statistics (MPLADS Portal)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Methodology & Neutrality Commitment */}
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-900 dark:text-stone-200 mb-3">
              Methodology &amp; Standards
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Methodology &amp; Data Pipeline
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Side-by-Side MP Comparison
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  All-India Geospatial Atlas
                </Link>
              </li>
              <li>
                <Link href="/about#minister-policy" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Minister Quota &amp; Governance Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Neutrality Guardrail */}
        <div className="pt-6 border-t border-stone-200 dark:border-[#1A2230] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-stone-500 dark:text-stone-400">
          <p className="text-center sm:text-left leading-relaxed max-w-3xl">
            Non-partisan civic transparency project. Declared criminal cases represent sworn affidavit filings, not judicial convictions. Performance indicators are descriptive official records and do not constitute rank or performance scorecards.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <span>Open Civic Data</span>
            <span>·</span>
            <Link href="/about" className="hover:underline">
              Review Sources
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
