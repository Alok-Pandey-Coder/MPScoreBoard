'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Printer, Send, FileText } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPHeader } from '@/components/mp/MPHeader';
import { PerformanceGrid } from '@/components/mp/PerformanceGrid';
import { ComparisonSection } from '@/components/mp/ComparisonSection';
import { MpladsSection } from '@/components/mp/MpladsSection';
import { MpladsWorksSection } from '@/components/mp/MpladsWorksSection';
import { AffidavitSection } from '@/components/mp/AffidavitSection';
import { ExplainSimplyPanel } from '@/components/mp/ExplainSimplyPanel';
import { TakeActionPanel } from '@/components/mp/TakeActionPanel';
import { SourcesFooter } from '@/components/mp/SourcesFooter';
import { Toast } from '@/components/common/Toast';
import { useLang, useMessages } from '@/context/LanguageContext';
import { cardMessages } from '@/lib/messages/card';
import { localizeState } from '@/lib/i18n';

interface MPReportCardClientProps {
  mp: MPRecord;
  /** How many MPs the state's PRS average is based on. */
  stateAverageN?: number;
}

const pillClass =
  'px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-[#141C28] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#1A2536] transition-colors border border-stone-200 dark:border-[#222E42] shrink-0 font-medium';

/**
 * Names, constituency, work descriptions, agencies and education text are shown
 * exactly as published in both languages (PRD 5.6); only the state and party
 * may be shown in Hindi, and each section does that at display time.
 */
export const MPReportCardClient: React.FC<MPReportCardClientProps> = ({ mp, stateAverageN }) => {
  const t = useMessages(cardMessages);
  const { lang } = useLang();
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setToastOpen(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      handleShowToast(t.toastLinkCopied);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 transition-colors">
      {/* Breadcrumb & Utilities Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <nav aria-label={t.breadcrumbLabel} className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
          <Link
            href="/"
            className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.breadcrumbHome}</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span>{localizeState(mp.state, lang)}</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-stone-900 dark:text-white font-bold">{mp.constituency}</span>
        </nav>

        <button
          onClick={handlePrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-[#141C28] hover:bg-stone-200 dark:hover:bg-[#1C2738] transition-colors border border-stone-200 dark:border-[#222E42] cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{t.printButton}</span>
        </button>
      </div>

      {/* Quick Jump Navigation Pill Bar */}
      <nav aria-label={t.jumpNavLabel} className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
        <a href="#indicators" className={pillClass}>
          {t.jumpIndicators}
        </a>
        <a href="#benchmarks" className={pillClass}>
          {t.jumpAverages}
        </a>
        <a href="#mplads" className={pillClass}>
          {t.jumpMplads}
        </a>
        <a href="#works" className={pillClass}>
          {t.jumpWorks}
        </a>
        <a href="#affidavit" className={pillClass}>
          {t.jumpAffidavit}
        </a>
        <a href="#sources" className={pillClass}>
          {t.jumpSources}
        </a>
        <a
          href="#explain"
          className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/30 shrink-0 font-medium flex items-center gap-1.5"
        >
          <FileText className="w-3 h-3" />
          <span>{t.jumpBriefing}</span>
        </a>
        <a
          href="#action"
          className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold hover:bg-stone-800 dark:hover:bg-white transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3 h-3" />
          <span>{t.jumpDraft}</span>
        </a>
      </nav>

      {/* 1. Identity Header */}
      <MPHeader mp={mp} onCopyLink={handleCopyLink} />

      {/* 2. Key Parliamentary Indicators */}
      <div id="indicators" className="scroll-mt-24">
        <PerformanceGrid mp={mp} />
      </div>

      {/* 3. Compared to Averages (Neutral Bars) */}
      <div id="benchmarks" className="scroll-mt-24">
        <ComparisonSection mp={mp} stateAverageN={stateAverageN} />
      </div>

      {/* 4. Local Area Development (MPLADS) */}
      <div id="mplads" className="scroll-mt-24">
        <MpladsSection mp={mp} />
      </div>

      {/* 4b. MPLADS Works list */}
      <div id="works" className="scroll-mt-24">
        <MpladsWorksSection mp={mp} />
      </div>

      {/* 5. Background / Affidavit Disclosures */}
      <div id="affidavit" className="scroll-mt-24">
        <AffidavitSection mp={mp} />
      </div>

      {/* 6. Factual Plain Language Briefing */}
      <div id="explain" className="scroll-mt-24">
        <ExplainSimplyPanel mp={mp} onCopyToast={handleShowToast} />
      </div>

      {/* 7. Take Action: Citizen Draft Generator */}
      <div id="action" className="scroll-mt-24">
        <TakeActionPanel mp={mp} onCopyToast={handleShowToast} />
      </div>

      {/* 8. Sources and Methodology */}
      <div id="sources" className="scroll-mt-24">
        <SourcesFooter mp={mp} />
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
