'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Languages, ShieldCheck, RefreshCw } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-[#0a0f1d] dark:via-[#0c162d] dark:to-[#0a0f1d] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/20 dark:border-blue-500/30 relative overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
            <Sparkles className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight font-['Outfit']">
                Explain Simply
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                Plain Language AI
              </span>
            </div>
            <p className="text-xs text-blue-200/70 mt-0.5">
              3-to-4 sentence factual brief grounded strictly in public data
            </p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1 bg-white/10 dark:bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <Languages className="w-4 h-4 text-blue-200 ml-2 mr-1" />
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              lang === 'en'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hinglish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              lang === 'hinglish'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[100px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex items-center gap-3 py-6 text-blue-200">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Generating plain-language explanation...</span>
          </div>
        ) : (
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-normal">
            {summary?.text}
          </p>
        )}

        {/* Bottom meta bar */}
        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-200/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Auto-generated summary verified by strict mathematical guardrails</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white self-start sm:self-auto bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/10 font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
