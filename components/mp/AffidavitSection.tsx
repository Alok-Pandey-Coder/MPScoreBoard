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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Background (As Declared in Election Affidavit)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Self-declared disclosures submitted to the Election Commission of India
          </p>
        </div>

        <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-full border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          2024 General Elections
        </span>
      </div>

      {/* Critical Legal Disclaimer Banner (PRD FR-8 & Section 5.9) */}
      <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-4.5 mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <p className="font-semibold text-amber-950 dark:text-amber-100 mb-0.5">
            Legal Note on Affidavit Disclosures
          </p>
          <p>
            Under the Representation of the People Act, candidates file sworn affidavits with the Election Commission. Declared cases are legal allegations or proceedings framed prior to election, not criminal convictions, unless explicitly determined by a court of law.
          </p>
        </div>
      </div>

      {isPending ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm font-['Outfit']">
                Election Affidavit Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                Affidavit verification for the 2024 Delhi parliamentary candidates is sourced from ECI Form 26 filings. Public records confirm {mp.name}&apos;s educational qualification as <strong>{mp.profile?.education || 'Graduate'}</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Total Declared Assets</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
              {formatRupeesInCrore(aff.assets)}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">As per Form 26 affidavit</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Declared Pending Cases</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
              {aff.declared_criminal_cases !== null && aff.declared_criminal_cases !== undefined
                ? aff.declared_criminal_cases
                : '0'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Allegations filed, not convictions</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Education</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-['Outfit']">
              {aff.education || mp.profile?.education || 'Graduate'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Highest declared qualification</span>
          </div>
        </div>
      )}
    </div>
  );
};
