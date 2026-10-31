import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Printer, Sparkles, Send } from 'lucide-react';
import { MPRecord } from '../types/mp';
import { MPHeader } from '../components/mp/MPHeader';
import { PerformanceGrid } from '../components/mp/PerformanceGrid';
import { ComparisonSection } from '../components/mp/ComparisonSection';
import { MpladsSection } from '../components/mp/MpladsSection';
import { AffidavitSection } from '../components/mp/AffidavitSection';
import { ExplainSimplyPanel } from '../components/mp/ExplainSimplyPanel';
import { TakeActionPanel } from '../components/mp/TakeActionPanel';
import { SourcesFooter } from '../components/mp/SourcesFooter';
import { Toast } from '../components/common/Toast';
import { NotFoundPage } from './NotFoundPage';
import aliasesData from '../data/aliases.json';

interface MPReportCardPageProps {
  mps: MPRecord[];
}

export const MPReportCardPage: React.FC<MPReportCardPageProps> = ({ mps }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  // Check alias redirect (PRD 5.7)
  useEffect(() => {
    if (slug && aliasesData.slug_redirects) {
      const redirectTarget = (aliasesData.slug_redirects as Record<string, string>)[slug];
      if (redirectTarget && redirectTarget !== slug) {
        navigate(`/mp/${redirectTarget}`, { replace: true });
      }
    }
  }, [slug, navigate]);

  const mp = mps.find((m) => m.slug === slug);

  // Set document title dynamically (PRD 10.6)
  useEffect(() => {
    if (mp) {
      document.title = `${mp.name} — ${mp.constituency}, ${mp.state}: Lok Sabha Report Card`;
    } else {
      document.title = 'MP Not Found — Mera MP, Mera Report Card';
    }
  }, [mp]);

  if (!mp) {
    return <NotFoundPage mps={mps} />;
  }

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setToastOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    handleShowToast('Direct card link copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      {/* Breadcrumb & Utilities Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{mp.state}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-semibold">{mp.constituency}</span>
        </nav>

        <button
          onClick={handlePrint}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Quick Jump Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
        <a
          href="#indicators"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          Indicators
        </a>
        <a
          href="#benchmarks"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          Averages
        </a>
        <a
          href="#mplads"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          MPLADS Funds
        </a>
        <a
          href="#affidavit"
          className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          Affidavit
        </a>
        <a
          href="#explain"
          className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800 shrink-0 flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          <span>Explain Simply</span>
        </a>
        <a
          href="#action"
          className="px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          <span>Draft Letter</span>
        </a>
      </div>

      {/* 1. Identity Header */}
      <MPHeader mp={mp} onCopyLink={handleCopyLink} />

      {/* 2. Key Parliamentary Indicators */}
      <div id="indicators" className="scroll-mt-24">
        <PerformanceGrid mp={mp} />
      </div>

      {/* 3. Compared to Averages (Neutral Bars) */}
      <div id="benchmarks" className="scroll-mt-24">
        <ComparisonSection mp={mp} />
      </div>

      {/* 4. Local Area Development (MPLADS) */}
      <MpladsSection mp={mp} />

      {/* 5. Background / Affidavit Disclosures */}
      <div id="affidavit" className="scroll-mt-24">
        <AffidavitSection mp={mp} />
      </div>

      {/* 6. AI & Template Plain Language Summary */}
      <div id="explain" className="scroll-mt-24">
        <ExplainSimplyPanel mp={mp} onCopyToast={handleShowToast} />
      </div>

      {/* 7. Take Action: Citizen Draft Generator */}
      <TakeActionPanel mp={mp} onCopyToast={handleShowToast} />

      {/* 8. Sources and Methodology */}
      <div id="sources" className="scroll-mt-24">
        <SourcesFooter mp={mp} />
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
