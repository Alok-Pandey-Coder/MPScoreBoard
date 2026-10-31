import React from 'react';
import { FileCheck, ShieldAlert, GraduationCap, Scale, IndianRupee, Info } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatDate, formatNumber, formatRupeesInCrore } from '@/lib/formatters';

interface AffidavitSectionProps {
  mp: MPRecord;
}

export const AffidavitSection: React.FC<AffidavitSectionProps> = ({ mp }) => {
  const aff = mp.affidavit;
  const isPending = !aff || aff.status !== 'reported';
  const year = aff?.election_year ?? null;
  const heading = year
    ? `As declared in the ${year} election affidavit`
    : 'As declared in the election affidavit';
  const asOf = aff?.as_of ? formatDate(aff.as_of) : null;
  const source = aff?.source ?? null;
  const education = aff?.education ?? null;

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Background</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">{heading}</p>
        </div>

        {!isPending && source?.name && (
          <span className="text-[11px] font-mono px-2.5 py-1 bg-stone-100 dark:bg-[#141C29] text-stone-700 dark:text-stone-300 rounded border border-stone-200 dark:border-[#222F42] self-start sm:self-auto">
            {source.url ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Source: {source.name}
              </a>
            ) : (
              <>Source: {source.name}</>
            )}
            {asOf ? ` · retrieved ${asOf}` : ''}
          </span>
        )}
      </div>

      {/* Critical Legal Disclaimer Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-5 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-mono">
          <p className="font-bold text-stone-900 dark:text-amber-300 mb-0.5 uppercase tracking-wide text-[11px]">
            Declarations are not convictions
          </p>
          <p className="text-[11px]">
            Under the Representation of the People Act, candidates file sworn Form 26 affidavits. Declared cases are legal allegations or proceedings framed prior to election, not criminal convictions, unless explicitly determined by a final court of law.
          </p>
        </div>
      </div>

      {isPending ? (
        <div className="bg-stone-50 dark:bg-[#121A26] border border-stone-200 dark:border-[#1E293B] rounded-lg p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-[#192231] text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 border border-stone-300 dark:border-[#26344A]">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-stone-700 dark:text-stone-300">
                Affidavit data not available for this seat yet.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" aria-hidden="true" />
              <span>Declared Total Assets</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
              {formatRupeesInCrore(aff.assets)}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">As per Form 26 filing</span>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <Scale className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" aria-hidden="true" />
              <span>Pending Cases Declared</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
              {formatNumber(aff.declared_criminal_cases)}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Allegations, not convictions</span>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>Declared Education</span>
            </div>
            <div className="text-base font-bold text-stone-900 dark:text-white mt-1 font-sans">
              {education ?? 'Not available from the source.'}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">As declared</span>
          </div>
        </div>
      )}
    </div>
  );
};
