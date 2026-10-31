'use client';

import React, { useState, useEffect } from 'react';
import { Send, Copy, Mail, Check, AlertCircle } from 'lucide-react';
import { CitizenIntent, MPRecord } from '@/types/mp';
import { generateCitizenDraft } from '@/lib/ai/draft';

interface TakeActionPanelProps {
  mp: MPRecord;
  onCopyToast: (msg: string) => void;
}

export const TakeActionPanel: React.FC<TakeActionPanelProps> = ({ mp, onCopyToast }) => {
  const [intent, setIntent] = useState<CitizenIntent>('mplads_works');
  const [lang, setLang] = useState<'en' | 'hinglish'>('en');
  const [citizenName, setCitizenName] = useState('');
  const [locality, setLocality] = useState('');
  const [specificIssue, setSpecificIssue] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [subject, setSubject] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate draft when inputs change
  useEffect(() => {
    const draft = generateCitizenDraft(mp, {
      intent,
      lang,
      citizenName,
      locality,
      specificIssue,
    });
    setSubject(draft.subject);
    setEditedBody(draft.body);
  }, [mp, intent, lang, citizenName, locality, specificIssue]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${editedBody}`);
    setCopied(true);
    onCopyToast('Draft letter copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedBody)}`;

  return (
    <div id="action" className="bg-white dark:bg-[#0E1420] rounded-xl p-5 sm:p-7 border border-stone-200/90 dark:border-[#1E2636] shadow-sm scroll-mt-24 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-stone-100 dark:border-[#1A2333]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-sans tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Citizen Action: Draft Official Communication</span>
          </h2>
          <p className="text-xs font-mono text-stone-500 dark:text-stone-400 mt-0.5">
            Structured representation letter grounded in verified public data
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#141C29] p-1 rounded-lg self-start sm:self-auto border border-stone-200 dark:border-[#222F42] text-xs font-mono">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hinglish')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              lang === 'hinglish'
                ? 'bg-white dark:bg-stone-100 text-stone-900 dark:text-stone-950 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Controls & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Intent Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              1. Select Representation Purpose
            </label>
            <div className="space-y-1.5">
              {[
                {
                  id: 'mplads_works' as CitizenIntent,
                  title: 'Inquire on MPLADS Works',
                  desc: 'Ask about local constituency spending & proposed infrastructure',
                },
                {
                  id: 'parliament_question' as CitizenIntent,
                  title: 'Request a Lok Sabha Question',
                  desc: 'Ask the MP to table a parliamentary question on a priority topic',
                },
                {
                  id: 'attendance_clarification' as CitizenIntent,
                  title: 'Constituency Engagement',
                  desc: 'Inquire on local outreach, office hours, and redressal forums',
                },
                {
                  id: 'general_feedback' as CitizenIntent,
                  title: 'Community Priority Feedback',
                  desc: 'Submit civic observations and constituency concerns',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIntent(item.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    intent === item.id
                      ? 'bg-amber-500/10 dark:bg-[#1A2536] border-amber-500 dark:border-amber-400'
                      : 'bg-stone-50 dark:bg-[#121A26] border-stone-200 dark:border-[#1E293B] hover:bg-stone-100 dark:hover:bg-[#172130]'
                  }`}
                >
                  <div className="font-semibold text-xs text-stone-900 dark:text-white font-sans">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-mono">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Citizen Inputs */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              2. Custom Details (Optional)
            </label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ramesh Sharma)"
                  value={citizenName}
                  maxLength={60}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ward / Locality (e.g. Karol Bagh, Ward 85)"
                  value={locality}
                  maxLength={60}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Briefly describe the specific issue (e.g. Primary health center staffing, storm water drain repair)..."
                  rows={2}
                  value={specificIssue}
                  onChange={(e) => setSpecificIssue(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-[#141C29] border border-stone-200 dark:border-[#222F42] rounded-lg text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Editable Draft Letter Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-stone-50/80 dark:bg-[#121A26] rounded-lg p-4 sm:p-5 border border-stone-200/90 dark:border-[#1E293B]">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Official Letter Draft
              </span>
              <span className="text-stone-400">Directly editable below</span>
            </div>

            <div className="mb-2.5">
              <label className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0E1420] border border-stone-200 dark:border-[#1E2636] rounded-lg text-xs font-mono font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold text-stone-500 dark:text-stone-400 uppercase block mb-1">
                Body
              </label>
              <textarea
                rows={11}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full p-3.5 bg-white dark:bg-[#0E1420] border border-stone-200 dark:border-[#1E2636] rounded-lg text-xs font-mono text-stone-800 dark:text-stone-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Buttons & Notice */}
          <div className="mt-4 pt-3.5 border-t border-stone-200 dark:border-[#1E293B]">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-stone-950" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Letter</span>
                  </>
                )}
              </button>

              <a
                href={mailtoUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Email</span>
              </a>
            </div>

            <div className="flex items-start gap-2 text-[10px] font-mono text-stone-500 dark:text-stone-400 leading-relaxed bg-white dark:bg-[#0E1420] p-2.5 rounded border border-stone-200 dark:border-[#1E2636]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Review before sending:</strong> This draft is prepared for your personal review. Mera MP does not transmit emails or communications on your behalf.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
