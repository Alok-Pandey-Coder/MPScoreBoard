import React, { useState } from 'react';
import { Share2, Award, MapPin, Calendar, Info, Copy } from 'lucide-react';
import { MPRecord } from '../../types/mp';
import { formatDate } from '../../lib/formatters';

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden transition-colors">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-5">
          {/* Avatar with Initials */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center font-extrabold text-slate-800 dark:text-slate-100 text-2xl sm:text-3xl shadow-inner font-['Outfit']">
              {mp.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-blue-600 text-white font-bold text-[10px] tracking-wider uppercase shadow">
              {mp.party}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                {mp.name}
              </h1>
              {isMinister && (
                <button
                  onClick={() => setShowMinisterModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-xs"
                  title="Click to view minister explanation"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Union Minister</span>
                  <Info className="w-3 h-3 text-amber-500 ml-0.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-sm text-slate-600 dark:text-slate-300 mb-3">
              <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {mp.constituency}
              </span>
              <span>•</span>
              <span>{mp.state}</span>
              <span>•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{mp.term}</span>
              {mp.reservation && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {mp.reservation} Category
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {mp.since_date && (
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Member since {formatDate(mp.since_date)}
                </span>
              )}
              {mp.profile?.education && (
                <span className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  Education: {mp.profile.education}
                </span>
              )}
              {mp.profile?.term_number && (
                <span className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  {mp.profile.term_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Share Card</span>
          </button>
          <button
            onClick={onCopyLink}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Copy direct card link"
            aria-label="Copy direct card link"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Minister Explanation Modal (PRD Section 5.2 FR-5 & Section 12) */}
      {showMinisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Why are parliamentary metrics not applicable?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official Parliamentary Procedure Explanation</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed mb-6">
              <p>
                In the Parliament of India, Members of Parliament who are inducted into the Union Council of Ministers (Ministers of State or Cabinet Ministers) serve on the treasury bench representing the Government.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-200">
                <li>Ministers do not sign the attendance register on the floor.</li>
                <li>Ministers do not submit questions to the government (they answer questions instead).</li>
                <li>Ministers cannot introduce Private Member Bills.</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                Therefore, standard parliamentary activity metrics are recorded as <strong>Not Applicable (Minister)</strong> rather than zero, ensuring fair and accurate reporting.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowMinisterModal(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
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
