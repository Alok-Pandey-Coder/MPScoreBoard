import React from 'react';
import type { Metadata } from 'next';
import { ExternalLink, Database, ShieldCheck, HelpCircle, Scale, Award } from 'lucide-react';
import { GitHubIcon } from '@/components/common/GitHubIcon';
import snapshotData from '@/data/processed/snapshot.json';

export const metadata: Metadata = {
  title: 'About the data — Mera MP',
  description: 'Where the data comes from, what each indicator means and does not mean, how ministers are handled, and known limits.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 transition-colors">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-[#232c37] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3 border border-cyan-200 dark:border-cyan-800/60">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Documentation &amp; Provenance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Methodology, Sources &amp; Transparency
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 text-base leading-relaxed">
          How &quot;Mera MP, Mera Report Card&quot; collects, normalises, and reviews parliamentary activity indicators for the 18th Lok Sabha.
        </p>
      </div>

      {/* Section 1: Product Philosophy */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-500" />
          <span>1. Core Philosophy &amp; Neutrality Principles</span>
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] shadow-sm">
          <p>
            <strong>Indicators, Not Verdicts:</strong> We provide structured, sourced indicators of parliamentary participation. We do not rate, grade, rank, or label MPs as &quot;good&quot; or &quot;bad&quot;. Quantitative indicators show recorded participation on the floor of the House; they do not encompass the qualitative depth of legislation, committee leadership, or constituency service.
          </p>
          <p>
            <strong>Zero False Data:</strong> We never convert missing data or pending records to zero. Unavailable fields show &quot;Not available&quot;.
          </p>
          <p>
            <strong>Traceable Provenance:</strong> Every number displayed on an MP&apos;s card is accompanied by its source name, URL, and the date it was captured or reported.
          </p>
        </div>
      </section>

      {/* Section 2: Data Sources Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-500" />
          <span>2. Data Sources &amp; Provenance</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] rounded-3xl border border-slate-200 dark:border-[#303A45] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#1D242D] text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#303A45]">
                <tr>
                  <th className="p-4">Source Organization</th>
                  <th className="p-4">Data Elements Collected</th>
                  <th className="p-4">Status &amp; As-Of</th>
                  <th className="p-4">Licence / Access</th>
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
                  <td className="p-4">Attendance %, Debates, Questions, Private Member Bills, State &amp; National Averages</td>
                  <td className="p-4">18th Lok Sabha (to 13 Aug 2026)</td>
                  <td className="p-4">CC BY 4.0 Attribution</td>
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
                  <td className="p-4">Official sitting members master list, MP IDs, tenure dates</td>
                  <td className="p-4">Current Sitting (Oct 2026)</td>
                  <td className="p-4">Official Parliamentary Portal</td>
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
                  <td className="p-4">7 Delhi parliamentary constituencies official directory</td>
                  <td className="p-4">Current Masterlist</td>
                  <td className="p-4">Official Government Portal</td>
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
                  <td className="p-4">Form 26 Sworn Candidate Affidavits (Assets, Education, Cases)</td>
                  <td className="p-4">2024 General Elections</td>
                  <td className="p-4">Statutory Public Filings</td>
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
          <span>3. Treatment of Ministers &amp; Special Roles</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>
            Members of the Lok Sabha who hold ministerial offices in the Union Council of Ministers (for example, Shri Harsh Malhotra, MP for East Delhi and Union Minister of State) are represented with <strong>Not Applicable (Minister)</strong> for standard floor indicators.
          </p>
          <p>
            By parliamentary convention:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ministers represent the executive government and do not sign the floor attendance register.</li>
            <li>Ministers respond to parliamentary questions rather than submitting questions to other ministries.</li>
            <li>Ministers do not introduce Private Member Bills.</li>
          </ul>
          <p>
            Treating these indicators as &quot;0&quot; would be factually incorrect and misleading.
          </p>
        </div>
      </section>

      {/* Section 4: Averages & Calculation Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-500" />
          <span>4. Calculation of Benchmarks &amp; Averages</span>
        </h2>
        <div className="bg-white dark:bg-[#171D24] p-6 rounded-3xl border border-slate-200 dark:border-[#303A45] text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed shadow-sm">
          <p>
            <strong>State Average:</strong> Computed across all MPs representing constituencies in that state, explicitly excluding ministers and null/missing entries.
          </p>
          <p>
            <strong>National Average:</strong> The nationwide benchmark of all non-minister sitting members across the 18th Lok Sabha as published by PRS Legislative Research.
          </p>
          <p>
            <strong>Difference Wording Thresholds:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>Attendance: within ±5.0 percentage points is described as <em>&quot;similar to average&quot;</em>; above as <em>&quot;higher than&quot;</em>; below as <em>&quot;lower than&quot;</em>.</li>
            <li>Debates &amp; Questions: within ±10% of the average is described as <em>&quot;similar to average&quot;</em>.</li>
          </ul>
        </div>
      </section>

      {/* Section 5: Unofficial Project Disclaimer */}
      <section className="bg-[#171D24] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#303A45] space-y-4">
        <h2 className="text-xl font-bold font-['Outfit']">
          5. Legal &amp; Academic Disclaimer
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          &quot;Mera MP, Mera Report Card&quot; is an independent civic project developed for citizen empowerment at hackCBS 9.0. It is not affiliated with, approved by, or representing the Parliament of India, the Election Commission of India, or any political party.
        </p>
        <div className="pt-4 border-t border-[#303A45] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <span>Active snapshot version: {snapshotData.snapshot_version}</span>
          <a
            href="https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <GitHubIcon className="w-4 h-4" />
            <span>Submit a data feedback issue on GitHub</span>
          </a>
        </div>
      </section>
    </div>
  );
}
