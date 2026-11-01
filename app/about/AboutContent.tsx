'use client';

import React from 'react';
import { ExternalLink, Database, ShieldCheck, HelpCircle, Scale, Award, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import { useMessages } from '@/context/LanguageContext';
import { aboutMessages } from '@/lib/messages/about';

/** Coverage figures computed on the server from the dataset (lib/coverage.ts). */
export interface AboutCoverage {
  seatCount: number;
  totalSeats: number;
  stateCount: number;
}

/** Client half of /about: methodology text in the chosen UI language. */
export function AboutContent({ snapshotVersion, coverage }: { snapshotVersion: string; coverage: AboutCoverage }) {
  const t = useMessages(aboutMessages);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 transition-colors">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-[#232c37] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3 border border-cyan-200 dark:border-cyan-800/60">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          {t.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-base leading-relaxed">
          {t.intro}
        </p>
      </div>

      {/* Section 1: Product Philosophy */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-500" />
          <span>{t.philosophyHeading}</span>
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] shadow-sm">
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
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-500" />
          <span>{t.sourcesHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] rounded-3xl border border-slate-200 dark:border-[#303A45] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#1D242D] text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#303A45]">
                <tr>
                  <th className="p-4">{t.colSource}</th>
                  <th className="p-4">{t.colElements}</th>
                  <th className="p-4">{t.colStatus}</th>
                  <th className="p-4">{t.colLicence}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27323f]">
                <tr>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
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
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
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
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
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
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
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
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Minister Handling */}
      <section id="minister-policy" className="space-y-4 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-500" />
          <span>{t.ministersHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>
            {t.ministersIntroBefore}
            <strong>{t.ministersNotApplicable}</strong>
            {t.ministersIntroAfter}
          </p>
          <p>
            {t.ministersConvention}
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t.ministersPoint1}</li>
            <li>{t.ministersPoint2}</li>
            <li>{t.ministersPoint3}</li>
          </ul>
          <p>
            {t.ministersZero}
          </p>
        </div>
      </section>

      {/* Section 4: Averages & Calculation Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-500" />
          <span>{t.averagesHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>
            <strong>{t.stateAvgLabel}</strong> {t.stateAvgBody}
          </p>
          <p>
            <strong>{t.nationalAvgLabel}</strong> {t.nationalAvgBody}
          </p>
          <p>
            <strong>{t.thresholdsLabel}</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
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

      {/* Section 5: Affidavit data */}
      <section id="affidavit-data" className="space-y-4 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-500" />
          <span>{t.affidavitHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>{t.affidavitSelfDeclared}</p>
          <p>{t.affidavitYear}</p>
          <p>{t.affidavitCases}</p>
          <p>{t.affidavitAssets}</p>
        </div>
      </section>

      {/* Section 6: Limitations and known gaps */}
      <section id="limitations" className="space-y-4 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyan-500" />
          <span>{t.limitationsHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
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

      {/* Section 7: AI usage and safeguards */}
      <section id="ai-safeguards" className="space-y-4 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-500" />
          <span>{t.aiHeading}</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>{t.aiScope}</p>
          <p>{t.aiChecks}</p>
          <p>{t.aiPipeline}</p>
          <p>{t.aiDrafts}</p>
        </div>
      </section>

      {/* Section 8: Unofficial Project Disclaimer */}
      <section className="bg-[#171D24] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#303A45] space-y-4">
        <h2 className="text-xl font-bold font-['Outfit']">
          {t.disclaimerHeading}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {t.disclaimer}
        </p>
        <div className="pt-4 border-t border-[#303A45] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <span>{t.snapshotVersion(snapshotVersion)}</span>
          <a
            href="https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <GitHubIcon className="w-4 h-4" />
            <span>{t.feedbackLink}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
