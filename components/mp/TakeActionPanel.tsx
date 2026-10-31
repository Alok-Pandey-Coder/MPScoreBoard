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
    <div id="action" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm scroll-mt-24 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Take Action: Draft a Letter to your MP</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn public data into constructive citizen engagement
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              lang === 'en'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hinglish')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              lang === 'hinglish'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Controls & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Intent Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              1. Choose Citizen Intent
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'mplads_works' as CitizenIntent,
                  title: 'Inquire on MPLADS Works',
                  desc: 'Ask about local development spending & proposed works',
                },
                {
                  id: 'parliament_question' as CitizenIntent,
                  title: 'Request a Question in Lok Sabha',
                  desc: 'Ask the MP to table a question on a local priority',
                },
                {
                  id: 'attendance_clarification' as CitizenIntent,
                  title: 'Parliamentary Representation Inquiry',
                  desc: 'Inquire on parliamentary focus and outreach channels',
                },
                {
                  id: 'general_feedback' as CitizenIntent,
                  title: 'Constituency Feedback',
                  desc: 'Share general community concerns and feedback',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIntent(item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    intent === item.id
                      ? 'bg-blue-50/80 dark:bg-blue-950/70 border-blue-400 dark:border-blue-500 ring-2 ring-blue-600/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-900 dark:text-white font-['Outfit']">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Citizen Inputs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              2. Customise (Optional)
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ramesh Sharma)"
                  value={citizenName}
                  maxLength={60}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Locality / Ward (e.g. Karol Bagh, Ward 85)"
                  value={locality}
                  maxLength={60}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <textarea
                  placeholder="Describe your specific local issue (e.g. Water logging near main market, hospital emergency wing need...)"
                  rows={2}
                  value={specificIssue}
                  onChange={(e) => setSpecificIssue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Editable Draft Letter Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Generated Editable Draft
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-400">You can edit the text directly</span>
            </div>

            <div className="mb-3">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Letter Body
              </label>
              <textarea
                rows={11}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Action Buttons & Notice */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Draft Letter</span>
                  </>
                )}
              </button>

              <a
                href={mailtoUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-white rounded-xl text-sm font-semibold shadow-md transition-all border border-transparent dark:border-slate-700"
              >
                <Mail className="w-4 h-4 text-blue-300" />
                <span>Open in Email App</span>
              </a>
            </div>

            {/* Crucial Ethical / Legal Notice (PRD FR-13) */}
            <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Review before sending:</strong> This is an editable citizen draft generated from public indicators. Mera MP does not send emails or messages on your behalf.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
