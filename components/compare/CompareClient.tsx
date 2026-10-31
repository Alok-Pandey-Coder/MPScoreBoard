'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GitCompare, Share2, ExternalLink, Info } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPAvatar } from '@/components/ui/MPAvatar';
import { Toast } from '@/components/common/Toast';
import { useLang, useMessages } from '@/context/LanguageContext';
import { compareMessages } from '@/lib/messages/compare';
import { formatNumber, formatPct } from '@/lib/formatters';

type MetricKey = 'attendance_pct' | 'debates' | 'questions' | 'private_member_bills';

const METRIC_ROWS: { key: MetricKey; label: 'attendance' | 'debates' | 'questions' | 'privateMemberBills' }[] = [
  { key: 'attendance_pct', label: 'attendance' },
  { key: 'debates', label: 'debates' },
  { key: 'questions', label: 'questions' },
  { key: 'private_member_bills', label: 'privateMemberBills' },
];

interface CompareClientProps {
  mps: MPRecord[];
}

export const CompareClient: React.FC<CompareClientProps> = ({ mps }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useMessages(compareMessages);

  const slugA = searchParams?.get('a') || mps[0]?.slug || '';
  const slugB = searchParams?.get('b') || mps[2]?.slug || mps[1]?.slug || '';

  const [selectedA, setSelectedA] = useState(slugA);
  const [selectedB, setSelectedB] = useState(slugB);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (selectedA && selectedB) {
      router.replace(`/compare?a=${selectedA}&b=${selectedB}`, { scroll: false });
    }
  }, [selectedA, selectedB, router]);

  const mpA = mps.find((m) => m.slug === selectedA) || mps[0];
  const mpB = mps.find((m) => m.slug === selectedB) || mps[1];

  // Ministers are outside PRS's tracking: their indicators are "not applicable",
  // never zero. Other missing values read "not available".
  const metricText = (mp: MPRecord, key: MetricKey): string => {
    const value = mp.performance?.[key];
    if (value === null || value === undefined) {
      if (mp.is_minister || mp.performance?.status === 'not_applicable') return t.notApplicableMinister;
    }
    return key === 'attendance_pct' ? formatPct(value, lang) : formatNumber(value, lang);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-[#1E2636]">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
            {t.eyebrow}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-sans tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          aria-label={t.shareAria}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 dark:bg-[#141C28] hover:bg-stone-200 dark:hover:bg-[#1E2838] text-stone-700 dark:text-stone-300 rounded-lg text-xs font-mono font-semibold transition-colors self-start sm:self-auto border border-stone-200 dark:border-[#222E42] cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-stone-400" />
          <span>{t.share}</span>
        </button>
      </div>

      {/* Mandatory Non-ranking Notice */}
      <div className="bg-stone-50 dark:bg-[#101622] border border-stone-200 dark:border-[#1E2636] rounded-lg p-3.5 flex items-center gap-3 text-xs font-mono text-stone-600 dark:text-stone-400">
        <Info className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          {t.notice}
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Selector MP A */}
        <div className="bg-white dark:bg-[#0E1420] p-4 sm:p-5 rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs">
          <label
            htmlFor="compare-member-a"
            className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
          >
            {t.memberA}
          </label>
          <select
            id="compare-member-a"
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#141C29]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>

        {/* Selector MP B */}
        <div className="bg-white dark:bg-[#0E1420] p-4 sm:p-5 rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs">
          <label
            htmlFor="compare-member-b"
            className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
          >
            {t.memberB}
          </label>
          <select
            id="compare-member-b"
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-[#141C29]">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table / Cards */}
      <div className="bg-white dark:bg-[#0E1420] rounded-xl border border-stone-200/90 dark:border-[#1E2636] shadow-xs overflow-hidden divide-y divide-stone-100 dark:divide-[#182232]">
        {/* Header Identity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100 dark:divide-[#182232]">
          {/* Card MP A */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#16202E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223044]">
                {mpA.party}
              </span>
              {mpA.is_minister && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                  {t.minister}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MPAvatar imageUrl={mpA.image_url} name={mpA.name} size="md" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-sans">
                  {mpA.name}
                </h2>
                <div className="text-xs text-stone-500 font-mono">{mpA.constituency}</div>
              </div>
            </div>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mb-3">
              {mpA.constituency}, {mpA.state}
            </p>
            <Link
              href={`/mp/${mpA.slug}`}
              className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{t.viewFull}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Card MP B */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-[#16202E] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#223044]">
                {mpB.party}
              </span>
              {mpB.is_minister && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                  {t.minister}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MPAvatar imageUrl={mpB.image_url} name={mpB.name} size="md" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-sans">
                  {mpB.name}
                </h2>
                <div className="text-xs text-stone-500 font-mono">{mpB.constituency}</div>
              </div>
            </div>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mb-3">
              {mpB.constituency}, {mpB.state}
            </p>
            <Link
              href={`/mp/${mpB.slug}`}
              className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{t.viewFull}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {METRIC_ROWS.map((row, i) => (
          <div key={row.key} className={i % 2 === 0 ? 'p-5 bg-stone-50/50 dark:bg-[#0C121D]/50' : 'p-5'}>
            <div className="text-center mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t[row.label]}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center font-mono">
              <div className="text-center md:text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                  {metricText(mpA, row.key)}
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tabular-nums">
                  {metricText(mpB, row.key)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Toast
        message={t.copied}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
