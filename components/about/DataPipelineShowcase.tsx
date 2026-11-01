'use client';

import React from 'react';
import Link from 'next/link';
import {
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Layers,
  Scale,
  Award,
  ExternalLink,
  Cpu,
  Lock,
} from 'lucide-react';
import { useMessages } from '@/context/LanguageContext';
import { aboutMessages } from '@/lib/messages/about';

export function DataPipelineShowcase() {
  const t = useMessages(aboutMessages);

  const pipelineStages = [
    {
      step: '01',
      title: 'Polite Ingestion',
      desc: 'Shared polite fetcher with honest User-Agent, robots.txt compliance, and 10s Crawl-delay. Zero CAPTCHA bypasses.',
      badge: 'Ethical Fetching',
    },
    {
      step: '02',
      title: 'Immutable Raw Stores',
      desc: 'Raw responses are preserved untouched in data/raw/ with timestamped snapshots (e.g. sansad.members.delhi.2026-10-31.json).',
      badge: 'Cryptographic Provenance',
    },
    {
      step: '03',
      title: 'Deterministic Parsing',
      desc: 'Python parsers extract structured fields. Zero LLMs format or generate stored numbers.',
      badge: 'Zero Hallucinations',
    },
    {
      step: '04',
      title: 'Entity Resolution',
      desc: 'Unified on normalized state + constituency primary keys with aliases.json resolution for spelling variations.',
      badge: 'Deduplicated Records',
    },
    {
      step: '05',
      title: 'Invariant Validation',
      desc: 'Automated 07_validate.py suite enforces: null never zero, ministers not applicable, attendance ≤ 100%, cross-check tolerance.',
      badge: '55 Automated Tests',
    },
  ];

  const sourceMappings = [
    {
      source: 'Lok Sabha (Digital Sansad)',
      url: 'https://sansad.in/ls',
      role: 'Official Baseline',
      elements: 'Sitting 18th Lok Sabha member list, party affiliations, constituency mappings, official portraits.',
      uiComponent: 'Report Card Dossier Header & State Explorers',
      uiHighlight: 'Member photo, verified badge, party pill, and tenure details.',
    },
    {
      source: 'PRS Legislative Research',
      url: 'https://prsindia.org',
      role: 'Legislative Activity',
      elements: 'Attendance percentage, questions asked, debates participated, private member bills, and state/national averages.',
      uiComponent: '4-Pillar Performance Scorecard & Comparison Bars',
      uiHighlight: 'Progress bars with "Higher than average" or "Similar to average (±5%)" neutral descriptors.',
    },
    {
      source: 'MoSPI eSAKSHI (via Empowered Indian)',
      url: 'https://www.mplads.mospi.gov.in',
      role: 'Local Funds & Works',
      elements: 'Cumulative term allocation, recommended amount, expenditure, and itemized development works.',
      uiComponent: 'MPLADS Utilization Gauge & 10-Item Works Tracker',
      uiHighlight: 'Spending ratio, unspent balance, and project lists with status badges & cost in ₹ Lakhs.',
    },
    {
      source: 'Election Commission of India (ECI Form 26)',
      url: 'https://affidavit.eci.gov.in',
      role: 'Statutory Disclosures',
      elements: 'Sworn candidate affidavits: declared movable/immovable assets, declared liabilities, education, and pending charges.',
      uiComponent: 'Financial & Affidavit Dossier',
      uiHighlight: 'Clear legal notice that declared cases are allegations/charges, never court convictions.',
    },
    {
      source: 'Meko Data MCP + Google Gemini',
      url: 'https://mcp.mekodata.ai',
      role: 'AI Civic Assistant',
      elements: 'Vector + keyword indexed dossiers of Delhi & Goa MPs, legislative rules, and civic jurisdictions.',
      uiComponent: 'JanSeva AI (Chat with AI) Drawer & /chat',
      uiHighlight: 'Factual conversational answers with verified citation badges and non-partisan guardrails.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Visual Pipeline Flowchart */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xl font-bold text-stone-900 dark:text-white font-sans">
            The Deterministic Data Pipeline
          </h3>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          How raw public records travel from official portals into the verified, immutable application snapshot served to citizens:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {pipelineStages.map((stage) => (
            <div
              key={stage.step}
              className="p-4 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] flex flex-col justify-between space-y-3 shadow-sm hover:border-cyan-500/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    {stage.step}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#1A2536] text-stone-600 dark:text-stone-300">
                    {stage.badge}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                  {stage.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data-to-UI Mapping Matrix */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xl font-bold text-stone-900 dark:text-white font-sans">
            {t.dataMappingHeading}
          </h3>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {t.dataMappingIntro}
        </p>

        <div className="space-y-3">
          {sourceMappings.map((map) => (
            <div
              key={map.source}
              className="p-5 rounded-2xl bg-white dark:bg-[#121A26] border border-stone-200 dark:border-[#202C3F] space-y-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-[#1E293B] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 dark:text-white text-sm">
                    {map.source}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20">
                    {map.role}
                  </span>
                </div>
                <a
                  href={map.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                >
                  <span>Verify at source portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-stone-400 uppercase tracking-wider text-[10px] block mb-1">
                    Captured Data Fields
                  </span>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                    {map.elements}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#162130] border border-stone-200/60 dark:border-[#223145]">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-[10px] font-bold block mb-1">
                    Powers Product UI: {map.uiComponent}
                  </span>
                  <p className="text-stone-700 dark:text-stone-200">
                    {map.uiHighlight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
