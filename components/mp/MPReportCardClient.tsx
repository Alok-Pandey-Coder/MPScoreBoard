'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Printer, Sparkles, Send } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPHeader } from '@/components/mp/MPHeader';
import { PerformanceGrid } from '@/components/mp/PerformanceGrid';
import { ComparisonSection } from '@/components/mp/ComparisonSection';
import { MpladsSection } from '@/components/mp/MpladsSection';
import { AffidavitSection } from '@/components/mp/AffidavitSection';
import { ExplainSimplyPanel } from '@/components/mp/ExplainSimplyPanel';
import { TakeActionPanel } from '@/components/mp/TakeActionPanel';
import { SourcesFooter } from '@/components/mp/SourcesFooter';
import { Toast } from '@/components/common/Toast';

interface MPReportCardClientProps {
  mp: MPRecord;
}

export const MPReportCardClient: React.FC<MPReportCardClientProps> = ({ mp }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setToastOpen(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      handleShowToast('Direct card link copied to clipboard');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      {/* Breadcrumb & Utilities Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{mp.state}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">{mp.constituency}</span>
        </nav>

        <button
          onClick={handlePrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#1a222d] hover:bg-slate-200 dark:hover:bg-[#222c3a] transition-colors border border-slate-200 dark:border-[#2f3b4a] cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Quick Jump Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <a
          href="#indicators"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1a222d] text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-[#2f3b4a] shrink-0"
        >
          Indicators
        </a>
        <a
          href="#benchmarks"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1a222d] text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-[#2f3b4a] shrink-0"
        >
          Averages
        </a>
        <a
          href="#mplads"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1a222d] text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-[#2f3b4a] shrink-0"
        >
          MPLADS Funds
        </a>
        <a
          href="#affidavit"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1a222d] text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-[#2f3b4a] shrink-0"
        >
          Affidavit
        </a>
        <a
          href="#explain"
          className="px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors border border-cyan-200 dark:border-cyan-800/60 shrink-0 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          <span>Explain Simply</span>
        </a>
        <a
          href="#action"
          className="px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shrink-0 flex items-center gap-1 shadow-sm"
        >
          <Send className="w-3 h-3" />
          <span>Draft Letter</span>
        </a>
      </div>

      {/* 1. Identity Header */}
      <MPHeader mp={mp} onCopyLink={handleCopyLink} />

      {/* 2. Key Parliamentary Indicators */}
      <div id="indicators" className="scroll-mt-24">
        <PerformanceGrid mp={mp} />
      </div>

      {/* 3. Compared to Averages (Neutral Bars) */}
      <div id="benchmarks" className="scroll-mt-24">
        <ComparisonSection mp={mp} />
      </div>

      {/* 4. Local Area Development (MPLADS) */}
      <div id="mplads" className="scroll-mt-24">
        <MpladsSection mp={mp} />
      </div>

      {/* 5. Background / Affidavit Disclosures */}
      <div id="affidavit" className="scroll-mt-24">
        <AffidavitSection mp={mp} />
      </div>

      {/* 6. AI & Template Plain Language Summary */}
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

