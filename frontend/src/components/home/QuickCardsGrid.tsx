import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { MPRecord } from '../../types/mp';

interface QuickCardsGridProps {
  mps: MPRecord[];
}

export const QuickCardsGrid: React.FC<QuickCardsGridProps> = ({ mps }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {mps.map((mp) => {
        const isMinister = mp.is_minister || mp.performance.status === 'not_applicable';
        const attendance = mp.performance.attendance_pct;
        const questions = mp.performance.questions;

        return (
          <Link
            key={mp.slug}
            to={`/mp/${mp.slug}`}
            className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500/60 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header with Avatar and Party */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-base group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-950 dark:group-hover:to-slate-800 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-all">
                    {mp.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base line-clamp-1 font-['Outfit']">
                      {mp.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {mp.constituency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  {mp.party}
                </span>
                {mp.reservation && mp.reservation !== 'GEN' && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
                    {mp.reservation} Seat
                  </span>
                )}
                {isMinister && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    Minister
                  </span>
                )}
              </div>

              {/* Key Indicators Mini Display */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 mb-4">
                {isMinister ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Executive Governance Role
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ministers do not sign attendance or ask questions.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Attendance</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit']">
                        {attendance !== null ? `${attendance}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Questions</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Outfit']">
                        {questions !== null ? questions : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
              <span>View Full Report Card</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
