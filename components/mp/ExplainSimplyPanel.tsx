'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Languages, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { getMPSummary, SummaryResult, AiLang } from '@/lib/ai/summary';
import { useLang, useMessages } from '@/context/LanguageContext';
import { cardMessages } from '@/lib/messages/card';

interface ExplainSimplyPanelProps {
  mp: MPRecord;
  onCopyToast: (msg: string) => void;
}

export const ExplainSimplyPanel: React.FC<ExplainSimplyPanelProps> = ({ mp, onCopyToast }) => {
  const { lang: globalLang } = useLang();
  const t = useMessages(cardMessages);
  const [lang, setLang] = useState<AiLang>(() => (globalLang === 'hi' ? 'hi' : 'en'));
  const [summary, setSummary] = useState<(SummaryResult & { slug: string }) | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLang(globalLang === 'hi' ? 'hi' : 'en');
  }, [globalLang]);

  // Loading until a summary for the current MP and language has arrived.
  const isLoading = summary?.slug !== mp.slug || summary.lang !== lang;

  useEffect(() => {
    let isCurrent = true;
    getMPSummary(mp, lang).then((res) => {
      if (isCurrent) setSummary({ ...res, slug: mp.slug });
    });

    return () => {
      isCurrent = false;
    };
  }, [mp, lang]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.text);
    setCopied(true);
    onCopyToast(t.toastSummaryCopied);
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
              <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight">
                {t.briefingHeading}
              </h2>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-[#141C28] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-[#202B3C]">
                {t.briefingBadge}
              </span>
            </div>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
              {t.briefingSubtitle}
            </p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C29] p-1 rounded-lg border border-stone-200 dark:border-[#222F42] self-start sm:self-auto text-xs font-mono">
          <Languages className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              lang === 'hi'
                ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            हिन्दी
          </button>
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
      <div className="relative min-h-[90px] flex flex-col justify-between" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <div className="flex items-center gap-2.5 py-6 text-stone-500 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" aria-hidden="true" />
            <span>{t.briefingLoading}</span>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
            {summary?.text}
          </p>
        )}

        {/* Bottom meta bar */}
        <div className="pt-4 mt-5 border-t border-stone-100 dark:border-[#1A2333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" aria-hidden="true" />
            <span>{t.briefingDisclosure}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white self-start sm:self-auto bg-stone-100 dark:bg-[#141C29] px-2.5 py-1 rounded border border-stone-200 dark:border-[#222F42] transition-colors cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.copyBriefing}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
