import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingThemePill } from './components/common/FloatingThemePill';
import { HomePage } from './pages/HomePage';
import { ExploreAtlasPage } from './pages/ExploreAtlasPage';
import { StateExplorationPage } from './pages/StateExplorationPage';
import { MPReportCardPage } from './pages/MPReportCardPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnifiedSearchBar } from './components/home/UnifiedSearchBar';
import { MPRecord } from './types/mp';
import mpsRawData from './data/mps.json';
import { X } from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const mps: MPRecord[] = mpsRawData as unknown as MPRecord[];

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppContent() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Keyboard shortcut listener: press '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#0c1015] text-[#F3F4F6] selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
        {/* Sticky Global Header */}
        <Header onOpenSearch={() => setSearchModalOpen(true)} />

        {/* Global Search Modal Overlay */}
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl bg-[#141a22] rounded-3xl p-6 shadow-2xl border border-[#2b3746] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-['Outfit']">
                  Search Lok Sabha Seats, MPs &amp; States
                </span>
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#1f2835] transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <UnifiedSearchBar
                mps={mps}
                autoFocus={true}
                onSelect={() => setSearchModalOpen(false)}
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Tip: Search &quot;Chandni Chowk&quot;, &quot;Bansuri Swaraj&quot;, or &quot;Manoj Tiwari&quot;</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1f2835] text-slate-400 border border-[#2b3746]">
                  ESC to close
                </kbd>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage mps={mps} />} />
            <Route path="/explore" element={<ExploreAtlasPage mps={mps} />} />
            <Route path="/state/:state" element={<StateExplorationPage mps={mps} />} />
            <Route path="/mp/:slug" element={<MPReportCardPage mps={mps} />} />
            <Route path="/compare" element={<ComparePage mps={mps} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/about/methodology" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage mps={mps} />} />
          </Routes>
        </main>

        {/* Floating Bottom Theme Slider / Pill (inspired by Nagrik screenshot 5) */}
        <FloatingThemePill />

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
