import React from 'react';
import { Info, Building2 } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatCrore, formatPct } from '@/lib/formatters';

interface MpladsSectionProps {
  mp: MPRecord;
}

export const MpladsSection: React.FC<MpladsSectionProps> = ({ mp }) => {
  const mplads = mp.mplads;
  const isPending = !mplads || mplads.status === 'pending';

  return (
    <div id="mplads" className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm scroll-mt-24 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Local Area Development Scheme (MPLADS)</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            18th Lok Sabha Constituency Fund Allocations &amp; Work Expenditure
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 dark:bg-[#141C29] text-stone-600 dark:text-stone-400 text-[11px] font-mono border border-stone-200/80 dark:border-[#222F42] self-start sm:self-auto">
          <span>Source: MoSPI / Empowered Indian</span>
        </div>
      </div>

      {isPending ? (
        <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 dark:text-stone-200 text-sm font-sans">
                18th Lok Sabha MPLADS Data Consolidation in Progress
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl font-mono">
                Official constituency expenditure reports from the MoSPI portal for the 18th Lok Sabha (2024–2029) are being consolidated. In the initial tenure period, local project recommendations, administrative sanctions, and tender approvals are actively underway.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-medium pt-0.5">
                Note: Fund utilisation is naturally lower during the early phase of a parliamentary tenure.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">Entitlement</span>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
                {formatCrore(mplads.entitlement)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">Funds Released</span>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
                {formatCrore(mplads.funds_released)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">Expenditure</span>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
                {formatCrore(mplads.expenditure)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">Utilisation</span>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {formatPct(mplads.utilisation_pct)}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase">Unspent Balance</span>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
                {formatCrore(mplads.unspent_balance)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#121A26] p-3 rounded-lg border border-stone-200 dark:border-[#1E293B]">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Fund utilisation is naturally progressive during a 5-year term as works are recommended, approved, and executed.</span>
          </div>
        </div>
      )}
    </div>
  );
};
