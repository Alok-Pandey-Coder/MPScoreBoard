import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GitCompare, Share2, ExternalLink, Info } from 'lucide-react';
import { MPRecord } from '../types/mp';
import { Toast } from '../components/common/Toast';

interface ComparePageProps {
  mps: MPRecord[];
}

export const ComparePage: React.FC<ComparePageProps> = ({ mps }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugA = searchParams.get('a') || mps[0]?.slug || '';
  const slugB = searchParams.get('b') || mps[2]?.slug || mps[1]?.slug || '';

  const [selectedA, setSelectedA] = useState(slugA);
  const [selectedB, setSelectedB] = useState(slugB);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    setSearchParams({ a: selectedA, b: selectedB });
  }, [selectedA, selectedB, setSearchParams]);

  const mpA = mps.find((m) => m.slug === selectedA) || mps[0];
  const mpB = mps.find((m) => m.slug === selectedB) || mps[1];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Compare Lok Sabha MPs</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Neutral, side-by-side indicator benchmarking without scoring or rankings
          </p>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors self-start sm:self-auto border border-slate-200 dark:border-slate-700"
        >
          <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Share Comparison</span>
        </button>
      </div>

      {/* Mandatory Non-ranking Notice (PRD 5.5 & 7.4) */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Comparisons reflect quantitative activity indicators from official parliamentary logs. They do not constitute a rank, score, or performance evaluation.
        </span>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector MP A */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Member A
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-slate-800">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>

        {/* Selector MP B */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Member B
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {mps.map((m) => (
              <option key={m.slug} value={m.slug} className="dark:bg-slate-800">
                {m.name} ({m.constituency}, {m.party})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Matrix Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Header Identity Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Card MP A */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {mpA.party}
              </span>
              {mpA.is_minister && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60">
                  Union Minister
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {mpA.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {mpA.constituency}, {mpA.state}
            </p>
            <Link
              to={`/mp/${mpA.slug}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>View Full Report Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card MP B */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {mpB.party}
              </span>
              {mpB.is_minister && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60">
                  Union Minister
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {mpB.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {mpB.constituency}, {mpB.state}
            </p>
            <Link
              to={`/mp/${mpB.slug}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>View Full Report Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Row 1: Attendance */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Parliamentary Attendance Rate
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance.attendance_pct !== null ? `${mpA.performance.attendance_pct}%` : 'N/A (Minister)'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance.attendance_pct !== null ? `${mpB.performance.attendance_pct}%` : 'N/A (Minister)'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Debates */}
        <div className="p-6">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Debates Participated
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance.debates !== null ? mpA.performance.debates : 'N/A'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance.debates !== null ? mpB.performance.debates : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Questions */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Questions Submitted
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance.questions !== null ? mpA.performance.questions : 'N/A'}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance.questions !== null ? mpB.performance.questions : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Private Member Bills */}
        <div className="p-6">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Private Member Bills
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-right">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpA.performance.private_member_bills !== null ? mpA.performance.private_member_bills : 0}
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {mpB.performance.private_member_bills !== null ? mpB.performance.private_member_bills : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        message="Comparison link copied to clipboard!"
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
