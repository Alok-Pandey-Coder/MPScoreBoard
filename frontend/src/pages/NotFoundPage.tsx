import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { MPRecord } from '../types/mp';
import { UnifiedSearchBar } from '../components/home/UnifiedSearchBar';

interface NotFoundPageProps {
  mps: MPRecord[];
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ mps }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mb-2">
          Constituency or Page Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The requested parliamentary constituency or MP slug was not found in our current dataset. Search below or return to the home directory.
        </p>
      </div>

      {/* Embedded Search Box (FR-17) */}
      <div className="text-left">
        <UnifiedSearchBar mps={mps} autoFocus={true} />
      </div>

      <div className="pt-4">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
          Or explore active Delhi constituencies:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {mps.slice(0, 5).map((m) => (
            <Link
              key={m.slug}
              to={`/mp/${m.slug}`}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              {m.constituency}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
