'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  GitCompare,
  MapPin,
  TrendingUp,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Search,
  Building,
  HelpCircle,
} from 'lucide-react';
import { useMessages, useLang } from '@/context/LanguageContext';
import { aboutMessages } from '@/lib/messages/about';

export function ProductShowcase() {
  const t = useMessages(aboutMessages);
  const lang = useLang();
  const [activeCardTab, setActiveCardTab] = useState<'regular' | 'minister' | 'mplads' | 'affidavit'>('regular');
  const [activeCompareMetric, setActiveCompareMetric] = useState<'attendance' | 'questions' | 'debates' | 'mplads'>('attendance');

  return (
    <div className="space-y-16">
      {/* Hero Mission Statement */}
      <div className="bg-gradient-to-br from-amber-500/10 via-cyan-500/5 to-transparent dark:from-cyan-950/40 dark:via-transparent p-6 sm:p-10 rounded-3xl border border-stone-200/80 dark:border-[#222E42] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.productBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight font-sans">
            {t.productHeroTitle}
          </h2>
          <p className="text-stone-600 dark:text-stone-300 text-base leading-relaxed">
            {t.productHeroSubtitle}
          </p>
        </div>
      </div>

      {/* Feature 1: The MP Report Card UI */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#222E42] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {t.featCardBadge}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {t.featCardTitle}
            </h3>
          </div>
          <Link
            href="/mp/new-delhi-delhi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition-all shadow-sm w-fit"
          >
            <span>{t.featCardTryLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed max-w-3xl">
          {t.featCardDesc}
        </p>

        {/* Interactive Mockup Preview Card */}
        <div className="bg-white dark:bg-[#121A26] rounded-3xl border border-stone-200 dark:border-[#202C3F] p-5 sm:p-7 shadow-lg space-y-6">
          {/* Mockup Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#1E293B]">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE UI PREVIEW · REPORT CARD COMPONENT</span>
            </div>
            {/* Interactive Tab Toggle */}
            <div className="flex items-center p-1 bg-stone-100 dark:bg-[#0E1520] rounded-xl border border-stone-200 dark:border-[#222E42] text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveCardTab('regular')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCardTab === 'regular'
                    ? 'bg-white dark:bg-[#1A2536] text-stone-900 dark:text-white font-bold shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Standard MP View
              </button>
              <button
                type="button"
                onClick={() => setActiveCardTab('minister')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCardTab === 'minister'
                    ? 'bg-white dark:bg-[#1A2536] text-stone-900 dark:text-white font-bold shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Union Minister View
              </button>
              <button
                type="button"
                onClick={() => setActiveCardTab('mplads')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCardTab === 'mplads'
                    ? 'bg-white dark:bg-[#1A2536] text-stone-900 dark:text-white font-bold shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                MPLADS Works
              </button>
              <button
                type="button"
                onClick={() => setActiveCardTab('affidavit')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeCardTab === 'affidavit'
                    ? 'bg-white dark:bg-[#1A2536] text-stone-900 dark:text-white font-bold shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Affidavit
              </button>
            </div>
          </div>

          {/* Member Banner Mockup */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-200 dark:bg-[#202C3F] relative shrink-0 border border-stone-300 dark:border-[#283850]">
                <Image
                  src={activeCardTab === 'minister' ? '/images/mps/north-goa-goa.jpg' : '/images/mps/new-delhi-delhi.jpg'}
                  alt="MP Preview Portrait"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
                    {activeCardTab === 'minister' ? 'Shripad Yesso Naik' : 'Bansuri Swaraj'}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    BJP
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activeCardTab === 'minister' ? 'North Goa, Goa' : 'New Delhi, Delhi'}</span>
                  <span>·</span>
                  <span>18th Lok Sabha (2024–29)</span>
                </p>
                {activeCardTab === 'minister' && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-bold border border-purple-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Union Minister of State (Power & NRE)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-stone-500 bg-white dark:bg-[#121A26] px-3 py-2 rounded-xl border border-stone-200 dark:border-[#222E42]">
              Source: Digital Sansad · Verified
            </div>
          </div>

          {/* Tab 1: Regular MP Scorecard */}
          {activeCardTab === 'regular' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145] space-y-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Attendance</span>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">96%</div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    Similar to State Avg (96%)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145] space-y-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Questions</span>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">201</div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                    Higher than State Avg (172)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145] space-y-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Debates</span>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">24</div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                    Higher than State Avg (20.2)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145] space-y-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Private Bills</span>
                  <div className="text-2xl font-black text-stone-900 dark:text-white">0</div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-stone-400 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono block">
                    State Avg: 0.5
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Union Minister Special Policy */}
          {activeCardTab === 'minister' && (
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-3">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-sm">
                <Info className="w-4 h-4 shrink-0" />
                <span>Constitutional Disclosure: Union Minister Performance Handling</span>
              </div>
              <p className="text-xs text-purple-900/80 dark:text-purple-200 leading-relaxed">
                By constitutional convention, Union Ministers represent the executive government. They do not sign the attendance register, ask questions to other ministries, or introduce private bills.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {['Attendance', 'Questions', 'Debates', 'Private Bills'].map((metric) => (
                  <div key={metric} className="p-2.5 rounded-xl bg-white/80 dark:bg-[#121A26] border border-purple-500/20 text-center">
                    <span className="text-[11px] text-stone-500 block">{metric}</span>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Not Applicable
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono italic">
                ✓ Invariant Guarantee: Ministers are NEVER scored as 0 or inactive.
              </p>
            </div>
          )}

          {/* Tab 3: MPLADS Fund & Paginated Works */}
          {activeCardTab === 'mplads' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145]">
                  <span className="text-xs text-stone-500">Allocated</span>
                  <div className="text-xl font-bold text-stone-900 dark:text-white">₹5.00 Cr</div>
                  <span className="text-[10px] text-stone-400 font-mono">18th Lok Sabha</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145]">
                  <span className="text-xs text-stone-500">Recommended</span>
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">₹4.12 Cr</div>
                  <span className="text-[10px] text-cyan-600/80 font-bold">82.4% Recommended</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145]">
                  <span className="text-xs text-stone-500">Expenditure</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹2.85 Cr</div>
                  <span className="text-[10px] text-emerald-600/80 font-bold">57.0% Utilised</span>
                </div>
              </div>

              {/* Sample 10-Item Paginated Works List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>SAMPLE LOCAL DEVELOPMENT WORKS (10-ITEM PAGINATION)</span>
                  <span>Showing 1–3 of 20 works</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] border border-stone-200/60 dark:border-[#223145] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        Installation of High-Mast Solar LED Lighting
                      </div>
                      <span className="text-[11px] text-stone-500">Public Infrastructure · Recommended: 12-Jul-2024</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Completed
                      </span>
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-200 text-xs mt-1">₹14.50 L</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] border border-stone-200/60 dark:border-[#223145] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        Community Health Clinic Infrastructure Upgradation
                      </div>
                      <span className="text-[11px] text-stone-500">Healthcare · Recommended: 28-Aug-2024</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        In Progress
                      </span>
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-200 text-xs mt-1">₹48.00 L</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] border border-stone-200/60 dark:border-[#223145] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        Rainwater Harvesting & Ground Recharge Well
                      </div>
                      <span className="text-[11px] text-stone-500">Sanitation & Water · Recommended: 15-Oct-2024</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        Recommended
                      </span>
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-200 text-xs mt-1">₹22.80 L</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Affidavit & Candidate Disclosures */}
          {activeCardTab === 'affidavit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200/70 dark:border-[#223145] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
                    2024 Lok Sabha Nomination Filing (Form 26)
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono">
                    ECI & MyNeta Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block">Total Assets</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-white">₹10.87 Crore</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Total Liabilities</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-white">₹5.09 Lakh</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Education</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-white">Graduate (B.A.)</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Declared Cases</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">0 Cases</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Legal Notice:</strong> Declared criminal cases represent pending police charges or allegations as declared by the candidate at nomination. They are <strong>allegations, not convictions</strong>, and are presented without editorial verdict.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature 2: Side-by-Side MP Comparison Tool */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#222E42] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {t.featCompareBadge}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {t.featCompareTitle}
            </h3>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition-all shadow-sm w-fit"
          >
            <span>{t.featCompareTryLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed max-w-3xl">
          {t.featCompareDesc}
        </p>

        {/* Side-by-Side Comparison Mockup */}
        <div className="bg-white dark:bg-[#121A26] rounded-3xl border border-stone-200 dark:border-[#202C3F] p-5 sm:p-7 shadow-lg space-y-5">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-100 dark:border-[#1E293B]">
            {/* MP 1 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-[#202C3F] relative shrink-0">
                <Image src="/images/mps/new-delhi-delhi.jpg" alt="Bansuri Swaraj" fill className="object-cover" />
              </div>
              <div>
                <h5 className="font-bold text-stone-900 dark:text-white text-sm">Bansuri Swaraj</h5>
                <p className="text-xs text-stone-500">New Delhi (Delhi) · BJP</p>
              </div>
            </div>

            {/* MP 2 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 dark:bg-[#202C3F] relative shrink-0">
                <Image src="/images/mps/south-goa-goa.jpg" alt="Captain Viriato Fernandes" fill className="object-cover" />
              </div>
              <div>
                <h5 className="font-bold text-stone-900 dark:text-white text-sm">Capt. Viriato Fernandes</h5>
                <p className="text-xs text-stone-500">South Goa (Goa) · INC</p>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] flex items-center justify-between">
              <div className="font-bold text-stone-900 dark:text-white text-sm">96%</div>
              <span className="font-mono text-stone-500 uppercase tracking-wider text-[11px]">Floor Attendance</span>
              <div className="font-bold text-stone-900 dark:text-white text-sm">87%</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] flex items-center justify-between">
              <div className="font-bold text-stone-900 dark:text-white text-sm">201</div>
              <span className="font-mono text-stone-500 uppercase tracking-wider text-[11px]">Questions Asked</span>
              <div className="font-bold text-stone-900 dark:text-white text-sm">84</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] flex items-center justify-between">
              <div className="font-bold text-stone-900 dark:text-white text-sm">24</div>
              <span className="font-mono text-stone-500 uppercase tracking-wider text-[11px]">Debates Participated</span>
              <div className="font-bold text-stone-900 dark:text-white text-sm">28</div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] flex items-center justify-between">
              <div className="font-bold text-stone-900 dark:text-white text-sm">₹10.87 Cr</div>
              <span className="font-mono text-stone-500 uppercase tracking-wider text-[11px]">Declared Assets</span>
              <div className="font-bold text-stone-900 dark:text-white text-sm">₹5.27 Cr</div>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 font-mono text-center">
            ✓ Strictly neutral alignment: No winner badges, ranking stars, or subjective color judgments.
          </p>
        </div>
      </section>

      {/* Feature 3: Interactive Geographic Atlas & State Explorer */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#222E42] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {t.featMapBadge}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {t.featMapTitle}
            </h3>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition-all shadow-sm w-fit"
          >
            <span>{t.featMapTryLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed max-w-3xl">
          {t.featMapDesc}
        </p>

        {/* State Explorer Preview Card */}
        <div className="bg-white dark:bg-[#121A26] rounded-3xl border border-stone-200 dark:border-[#202C3F] p-5 sm:p-7 shadow-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/state/delhi"
              className="group p-5 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200 dark:border-[#223145] hover:border-amber-500/50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  NCT of Delhi
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  7/7 Seats Covered
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Chandni Chowk, East Delhi, New Delhi, North East Delhi, North West Delhi (SC), South Delhi, West Delhi.
              </p>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                Explore Delhi Delegation <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/state/goa"
              className="group p-5 rounded-2xl bg-stone-50 dark:bg-[#162130] border border-stone-200 dark:border-[#223145] hover:border-amber-500/50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Goa
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  2/2 Seats Covered
                </span>
              </div>
              <p className="text-xs text-stone-500">
                North Goa (Shripad Yesso Naik - BJP), South Goa (Captain Viriato Fernandes - INC).
              </p>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                Explore Goa Delegation <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 4: JanSeva AI (Chat with AI) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#222E42] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {t.featChatBadge}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {t.featChatTitle}
            </h3>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold transition-all shadow-sm w-fit"
          >
            <span>{t.featChatTryLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed max-w-3xl">
          {t.featChatDesc}
        </p>

        {/* AI Chat Window Mockup */}
        <div className="bg-white dark:bg-[#121A26] rounded-3xl border border-stone-200 dark:border-[#202C3F] p-5 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1E293B]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-900 dark:text-white text-sm">JanSeva AI (जनसेवा AI)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Grounded in Meko MCP + Gemini
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-stone-900 text-white dark:bg-white dark:text-stone-900 p-3 rounded-2xl max-w-md rounded-br-none shadow-sm">
                How much MPLADS fund was spent in New Delhi, and what are some recent projects?
              </div>
            </div>

            {/* AI Assistant Message */}
            <div className="flex justify-start">
              <div className="bg-stone-50 dark:bg-[#162130] text-stone-800 dark:text-stone-200 p-4 rounded-2xl max-w-lg rounded-bl-none border border-stone-200/70 dark:border-[#223145] space-y-2">
                <p>
                  According to official MoSPI eSAKSHI records for the 18th Lok Sabha, <strong>₹2.85 Crore</strong> has been expended in New Delhi constituency out of ₹5.00 Crore allocated (57.0% utilization).
                </p>
                <p>Recent recorded development works include:</p>
                <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-300">
                  <li>Installation of High-Mast Solar LED Lighting (₹14.50 L) — Completed</li>
                  <li>Community Health Clinic Infrastructure Upgradation (₹48.00 L) — In Progress</li>
                </ul>
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-stone-400">
                  <span>Citations:</span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-[#202C3F] text-stone-700 dark:text-stone-300">
                    MoSPI eSAKSHI (2026-10-31)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-[#202C3F] text-stone-700 dark:text-stone-300">
                    Digital Sansad Member Registry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="space-y-6 pt-6">
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-sans">
          {t.principlesHeading}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">{t.principle1Title}</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{t.principle1Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">{t.principle2Title}</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{t.principle2Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">{t.principle3Title}</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{t.principle3Desc}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] space-y-2 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-stone-900 dark:text-white text-base">{t.principle4Title}</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{t.principle4Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
