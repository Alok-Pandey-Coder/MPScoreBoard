'use client';

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Database,
  ShieldCheck,
  HelpCircle,
  Scale,
  Award,
  FileText,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import { useMessages } from '@/context/LanguageContext';
import { aboutMessages } from '@/lib/messages/about';
import { getAllStateImages, getStateIconSets } from '@/lib/stateImages';
import { ProductShowcase } from '@/components/about/ProductShowcase';
import { DataPipelineShowcase } from '@/components/about/DataPipelineShowcase';

/** Coverage figures computed on the server from the dataset (lib/coverage.ts). */
export interface AboutCoverage {
  seatCount: number;
  totalSeats: number;
  stateCount: number;
}

/** Client half of /about: methodology and product showcase text in the chosen UI language. */
export function AboutContent({
  snapshotVersion,
  coverage,
  initialTab = 'product',
}: {
  snapshotVersion: string;
  coverage: AboutCoverage;
  initialTab?: 'product' | 'data';
}) {
  const t = useMessages(aboutMessages);
  const [activeTab, setActiveTab] = useState<'product' | 'data'>(initialTab);

  // Sync with anchor hash if present (e.g. #minister-policy, #affidavit-data, #limitations)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (
        hash === '#minister-policy' ||
        hash === '#affidavit-data' ||
        hash === '#limitations' ||
        hash === '#ai-safeguards' ||
        hash === '#sources-table'
      ) {
        setActiveTab('data');
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors">
      {/* Top Header & Tab Switcher */}
      <div className="border-b border-stone-200 dark:border-[#222E42] pb-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-2 border border-cyan-200 dark:border-cyan-800/60">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-sans tracking-tight">
              {activeTab === 'product' ? t.productHeroTitle : t.title}
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
              {activeTab === 'product' ? t.productHeroSubtitle : t.intro}
            </p>
          </div>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-100 dark:bg-[#121A26] rounded-2xl border border-stone-200 dark:border-[#222E42] w-fit shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'product'
                ? 'bg-white dark:bg-[#1E293B] text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title={t.tabProductHint}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.tabProduct}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'data'
                ? 'bg-white dark:bg-[#1E293B] text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title={t.tabDataHint}
          >
            <Database className="w-4 h-4 text-cyan-500" />
            <span>{t.tabData}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ABOUT THE PRODUCT & UI SHOWCASE */}
      {activeTab === 'product' && (
        <div className="animate-in fade-in duration-300">
          <ProductShowcase />
        </div>
      )}

      {/* VIEW 2: ABOUT THE DATA & METHODOLOGY */}
      {activeTab === 'data' && (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Data Pipeline & UI Mapping Showcase */}
          <DataPipelineShowcase />

          {/* Section 1: Product Philosophy */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <span>{t.philosophyHeading}</span>
            </h2>
            <div className="text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] shadow-sm">
              <p>
                <strong>{t.indicatorsLabel}</strong> {t.indicatorsBody}
              </p>
              <p>
                <strong>{t.noFalseDataLabel}</strong> {t.noFalseDataBody}
              </p>
              <p>
                <strong>{t.provenanceLabel}</strong> {t.provenanceBody}
              </p>
            </div>
          </section>

          {/* Section 2: Data Sources Table */}
          <section id="sources-table" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-500" />
              <span>{t.sourcesHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] rounded-3xl border border-stone-200 dark:border-[#202C3F] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600 dark:text-stone-300">
                  <thead className="bg-stone-50 dark:bg-[#162130] text-stone-700 dark:text-stone-200 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-[#202C3F]">
                    <tr>
                      <th className="p-4">{t.colSource}</th>
                      <th className="p-4">{t.colElements}</th>
                      <th className="p-4">{t.colStatus}</th>
                      <th className="p-4">{t.colLicence}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-[#1E293B]">
                    <tr>
                      <td className="p-4 font-semibold text-stone-900 dark:text-white">
                        <a
                          href="https://prsindia.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>PRS Legislative Research</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4">{t.prsElements}</td>
                      <td className="p-4">{t.prsStatus}</td>
                      <td className="p-4">{t.prsLicence}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-stone-900 dark:text-white">
                        <a
                          href="https://sansad.in/ls"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Lok Sabha (Digital Sansad)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4">{t.sansadElements}</td>
                      <td className="p-4">{t.sansadStatus}</td>
                      <td className="p-4">{t.sansadLicence}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-stone-900 dark:text-white">
                        <a
                          href="https://delhi.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Govt of NCT of Delhi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4">{t.delhiElements}</td>
                      <td className="p-4">{t.delhiStatus}</td>
                      <td className="p-4">{t.delhiLicence}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-stone-900 dark:text-white">
                        <a
                          href="https://affidavit.eci.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Election Commission of India</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4">{t.eciElements}</td>
                      <td className="p-4">{t.eciStatus}</td>
                      <td className="p-4">{t.eciLicence}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-stone-900 dark:text-white">
                        <a
                          href="https://www.mplads.mospi.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>MoSPI eSAKSHI (via Empowered Indian)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-4">MPLADS Allocations, Recommended & Expenditure Totals, Itemized Works</td>
                      <td className="p-4">18th Lok Sabha (Oct 2026)</td>
                      <td className="p-4">Official MoSPI Portal / Aggregated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 3: Minister Handling */}
          <section id="minister-policy" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-500" />
              <span>{t.ministersHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed shadow-sm">
              <p>
                {t.ministersIntroBefore}
                <strong className="text-purple-600 dark:text-purple-400">{t.ministersNotApplicable}</strong>
                {t.ministersIntroAfter}
              </p>
              <p>{t.ministersConvention}</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t.ministersPoint1}</li>
                <li>{t.ministersPoint2}</li>
                <li>{t.ministersPoint3}</li>
              </ul>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{t.ministersZero}</p>
            </div>
          </section>

          {/* Section 4: Averages & Calculation Rules */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-500" />
              <span>{t.averagesHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed shadow-sm">
              <p>
                <strong>{t.stateAvgLabel}</strong> {t.stateAvgBody}
              </p>
              <p>
                <strong>{t.nationalAvgLabel}</strong> {t.nationalAvgBody}
              </p>
              <p>
                <strong>{t.thresholdsLabel}</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-stone-700 dark:text-stone-300">
                <li>
                  {t.thrAttendance1}
                  <em>{t.thrSimilar}</em>
                  {t.thrAttendance2}
                  <em>{t.thrHigher}</em>
                  {t.thrAttendance3}
                  <em>{t.thrLower}</em>
                  {t.thrAttendance4}
                </li>
                <li>
                  {t.thrCounts1}
                  <em>{t.thrSimilar}</em>
                  {t.thrCounts2}
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Affidavit Data */}
          <section id="affidavit-data" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" />
              <span>{t.affidavitHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed shadow-sm">
              <p>{t.affidavitSelfDeclared}</p>
              <p>{t.affidavitYear}</p>
              <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                <strong>Important Legal Distinction:</strong> {t.affidavitCases}
              </p>
              <p>{t.affidavitAssets}</p>
            </div>
          </section>

          {/* Section 6: Limitations & Known Gaps */}
          <section id="limitations" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyan-500" />
              <span>{t.limitationsHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed shadow-sm">
              <ul className="list-disc pl-5 space-y-2">
                <li>{t.limitCoverage(coverage.seatCount, coverage.totalSeats, coverage.stateCount)}</li>
                <li>{t.limitWorks}</li>
                <li>{t.limitSecondary}</li>
                <li>{t.limitActivity}</li>
                <li>{t.limitMinisters}</li>
                <li>{t.limitSnapshot}</li>
              </ul>
            </div>
          </section>

          {/* Section 7: AI Usage & Safeguards */}
          <section id="ai-safeguards" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white font-sans flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span>{t.aiHeading}</span>
            </h2>
            <div className="bg-white dark:bg-[#121A26] p-6 rounded-3xl border border-stone-200 dark:border-[#202C3F] text-sm text-stone-600 dark:text-stone-300 space-y-3 leading-relaxed shadow-sm">
              <p>{t.aiScope}</p>
              <p>{t.aiChecks}</p>
              <p className="font-semibold text-stone-900 dark:text-stone-100">{t.aiPipeline}</p>
            </div>
          </section>

          {/* Section 8: Image & Icon Credits */}
          <section id="image-credits" className="space-y-3">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.iconCreditsNote(getStateIconSets().map((s) => s.name).join(', '))}
            </p>
          </section>
          {getAllStateImages().length > 0 && (
            <section id="photo-credits" className="space-y-3">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">{t.imageCreditsHeading}</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{t.imageCreditsNote}</p>
              <ul className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
                {getAllStateImages().map((img) => (
                  <li key={img.stateId}>
                    <a href={img.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                      {img.subject}
                    </a>
                    {img.author ? ` — ${img.author}` : ''}, {img.licence}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Universal Footer: Disclaimer, Snapshot & Feedback */}
      <section className="bg-stone-900 text-white dark:bg-[#0E1520] p-6 sm:p-8 rounded-3xl shadow-xl border border-stone-800 dark:border-[#202C3F] space-y-4">
        <h2 className="text-xl font-bold font-sans">
          {t.disclaimerHeading}
        </h2>
        <p className="text-sm text-stone-300 leading-relaxed">
          {t.disclaimer}
        </p>
        <div className="pt-4 border-t border-stone-800 dark:border-[#202C3F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-400">
          <span className="font-mono">{t.snapshotVersion(snapshotVersion)}</span>
          <a
            href="https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
          >
            <GitHubIcon className="w-4 h-4" />
            <span>{t.feedbackLink}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
