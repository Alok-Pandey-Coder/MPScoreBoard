import React from 'react';
import { Info, Building2 } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { formatCrore, formatPct } from '../../lib/formatters';

interface MpladsSectionProps {
  mp: MPRecord;
}

export const MpladsSection: React.FC<MpladsSectionProps> = ({ mp }) => {
  const mplads = mp.mplads;
  const isPending = !mplads || mplads.status === 'pending';

  return (
    <div id="mplads" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm scroll-mt-24 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Local Area Development Scheme (MPLADS)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Parliamentary constituency development funds allocation &amp; expenditure
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200/60 dark:border-slate-700 self-start sm:self-auto">
          <span>Source: Ministry of Statistics &amp; Programme Implementation</span>
        </div>
      </div>

      {isPending ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-['Outfit']">
                18th Lok Sabha MPLADS Data Consolidation in Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Official constituency-wise expenditure reports from the MoSPI MPLADS portal for the 18th Lok Sabha (2024–2029) are being consolidated. In the initial period of a parliamentary term, project recommendations, administrative sanctions, and tender approvals are typically underway.
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-1">
                Note: Fund utilisation is naturally lower during the early phase of a parliamentary tenure.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Entitlement</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                {formatCrore(mplads.entitlement)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Funds Released</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                {formatCrore(mplads.funds_released)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Expenditure</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                {formatCrore(mplads.expenditure)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Utilisation</span>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1 font-['Outfit']">
                {formatPct(mplads.utilisation_pct)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Unspent Balance</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
                {formatCrore(mplads.unspent_balance)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Fund utilisation is naturally lower early in a term as development works are recommended and sanctioned.</span>
          </div>
        </div>
      )}
    </div>
  );
};
