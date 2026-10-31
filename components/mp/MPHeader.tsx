'use client';

import React, { useState } from 'react';
import { Share2, Award, MapPin, Calendar, Info, Copy, GraduationCap, Clock } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { formatDate } from '@/lib/formatters';

interface MPHeaderProps {
  mp: MPRecord;
  onCopyLink: () => void;
}

export const MPHeader: React.FC<MPHeaderProps> = ({ mp, onCopyLink }) => {
  const [showMinisterModal, setShowMinisterModal] = useState(false);
  const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mp.name} — ${mp.constituency}, ${mp.state}: Lok Sabha Report Card`,
          text: `Check out the parliamentary record of ${mp.name} (${mp.constituency}) on Mera MP, Mera Report Card.`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fall back to copy
      }
    }
    navigator.clipboard.writeText(window.location.href);
    onCopyLink();
  };

  return (
    <div className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm relative overflow-hidden transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          {/* Avatar Seal with Initials */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 dark:bg-[#151E2B] border border-stone-300 dark:border-[#26344A] flex items-center justify-center font-bold font-mono text-stone-800 dark:text-stone-100 text-xl sm:text-2xl shadow-inner">
              {mp.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.2 rounded bg-stone-900 dark:bg-amber-600 text-white font-bold font-mono text-[10px] tracking-wider uppercase shadow-xs">
              {mp.party}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-sans">
                {mp.name}
              </h1>
              {isMinister && (
                <button
                  onClick={() => setShowMinisterModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  title="Click to view minister explanation"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Minister</span>
                  <Info className="w-3 h-3 text-amber-500 ml-0.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs font-mono text-stone-600 dark:text-stone-400 mb-2.5">
              <span className="flex items-center gap-1 font-semibold text-stone-900 dark:text-white">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {mp.constituency}
              </span>
              <span>·</span>
              <span>{mp.state}</span>
              <span>·</span>
              <span className="text-stone-700 dark:text-stone-300">{mp.term}</span>
              {mp.reservation && mp.reservation !== 'GEN' && (
                <>
                  <span>·</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                    {mp.reservation} Category
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
              {mp.since_date && (
                <span className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C28] px-2 py-0.5 rounded border border-stone-200 dark:border-[#202B3B]">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  Elected {formatDate(mp.since_date)}
                </span>
              )}
              {mp.profile?.education && (
                <span className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C28] px-2 py-0.5 rounded border border-stone-200 dark:border-[#202B3B]">
                  <GraduationCap className="w-3 h-3 text-stone-400" />
                  {mp.profile.education}
                </span>
              )}
              {mp.profile?.term_number && (
                <span className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C28] px-2 py-0.5 rounded border border-stone-200 dark:border-[#202B3B]">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {mp.profile.term_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-[#141C28] hover:bg-stone-200 dark:hover:bg-[#1A2536] border border-stone-200 dark:border-[#222E42] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Share Dossier</span>
          </button>
          <button
            onClick={onCopyLink}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#141C28] hover:bg-stone-200 dark:hover:bg-[#1A2536] border border-stone-200 dark:border-[#222E42] transition-colors cursor-pointer"
            title="Copy direct dossier link"
            aria-label="Copy direct dossier link"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Minister Explanation Modal */}
      {showMinisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1420] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-[#1E2636] animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white font-sans">
                  Why are parliamentary metrics not applicable?
                </h3>
                <p className="text-xs font-mono text-stone-500 dark:text-stone-400">PRS Legislative Research excludes ministers from these indicators</p>
              </div>
            </div>

            <div className="text-xs text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed mb-5">
              <p>
                In the Parliament of India, Members of Parliament who serve in the Union Council of Ministers (Cabinet Ministers or Ministers of State) represent the Government on the treasury bench.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-700 dark:text-stone-200 font-mono text-[11px]">
                <li>Ministers do not sign the attendance register on the floor of the House.</li>
                <li>Ministers cannot submit questions to the government (they answer questions on behalf of ministries).</li>
                <li>Ministers cannot introduce Private Member Bills.</li>
              </ul>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#141C28] p-3 rounded-lg border border-stone-200 dark:border-[#222E42]">
                Therefore, standard activity metrics are accurately recorded as <strong>Not Applicable (Minister)</strong> rather than zero, ensuring factual reporting per parliamentary conventions.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMinisterModal(false)}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
