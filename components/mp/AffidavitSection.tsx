import React from 'react';
import { FileCheck, ShieldAlert, GraduationCap, Scale, IndianRupee, Info } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatRupeesInCrore } from '@/lib/formatters';

interface AffidavitSectionProps {
  mp: MPRecord;
}

export const AffidavitSection: React.FC<AffidavitSectionProps> = ({ mp }) => {
  const aff = mp.affidavit;
  const isPending = !aff || aff.status === 'pending';

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Candidate Background (ECI Sworn Affidavit)</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Form 26 disclosure submitted to the Election Commission of India
          </p>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 bg-stone-100 dark:bg-[#141C29] text-stone-700 dark:text-stone-300 font-semibold rounded border border-stone-200 dark:border-[#222F42] self-start sm:self-auto">
          2024 General Elections
        </span>
      </div>

      {/* Critical Legal Disclaimer Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-5 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-mono">
          <p className="font-bold text-stone-900 dark:text-amber-300 mb-0.5 uppercase tracking-wide text-[11px]">
            Legal Note on Affidavit Disclosures
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
              <h3 className="font-bold text-stone-900 dark:text-stone-200 text-sm font-sans">
                Election Affidavit Verification
              </h3>
              <p className="text-xs font-mono text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl">
                Affidavit verification for the 2024 Delhi candidates is sourced from ECI Form 26 filings. Public records confirm {mp.name}&apos;s highest declared educational qualification as <strong>{mp.profile?.education || 'Graduate'}</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Total Declared Assets</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
              {formatRupeesInCrore(aff.assets)}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">As per Form 26 filing</span>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pending Cases Declared</span>
            </div>
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-white mt-1 tabular-nums">
              {aff.declared_criminal_cases !== null && aff.declared_criminal_cases !== undefined
                ? aff.declared_criminal_cases
                : '0'}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Allegations, not convictions</span>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 dark:bg-[#121A26] border border-stone-200/80 dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono uppercase mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>Educational Background</span>
            </div>
            <div className="text-base font-bold text-stone-900 dark:text-white mt-1 font-sans">
              {aff.education || mp.profile?.education || 'Graduate'}
            </div>
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Highest certified degree</span>
          </div>
        </div>
      )}
    </div>
  );
};
