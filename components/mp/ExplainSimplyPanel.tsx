'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Languages, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { getMPSummary, SummaryResult } from '@/lib/ai/summary';

interface ExplainSimplyPanelProps {
  mp: MPRecord;
  onCopyToast: (msg: string) => void;
}

export const ExplainSimplyPanel: React.FC<ExplainSimplyPanelProps> = ({ mp, onCopyToast }) => {
  const [lang, setLang] = useState<'en' | 'hinglish'>('en');
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    getMPSummary(mp, lang).then((res) => {
      if (isCurrent) {
        setSummary(res);
        setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [mp, lang]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.text);
    setCopied(true);
    onCopyToast('Summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0E1420] text-stone-900 dark:text-stone-100 rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm relative overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-sans tracking-tight">
                Plain-Language Briefing
              </h3>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-[#141C28] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#202B3C]">
                Strict Data Synthesis
              </span>
            </div>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              3-to-4 sentence summary grounded strictly in official records
            </p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C29] p-1 rounded-lg border border-stone-200 dark:border-[#222F42] self-start sm:self-auto text-xs font-mono">
          <Languages className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hinglish')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              lang === 'hinglish'
                ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[90px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex items-center gap-2.5 py-6 text-stone-500 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Synthesizing factual records...</span>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
            {summary?.text}
          </p>
        )}

        {/* Bottom meta bar */}
        <div className="pt-4 mt-5 border-t border-stone-100 dark:border-[#1A2333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Mathematical guardrails prevent hallucination or unsourced claims</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white self-start sm:self-auto bg-stone-100 dark:bg-[#141C29] px-2.5 py-1 rounded border border-stone-200 dark:border-[#222F42] transition-colors cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy briefing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
