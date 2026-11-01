'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  Maximize2,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import type { ChatMessage, ChatSourceCitation } from '@/lib/ai/chat';

export const FloatingChatButton: React.FC = () => {
  const pathname = usePathname();
  const { lang: uiLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; sources?: ChatSourceCitation[] }>
  >([
    {
      role: 'assistant',
      content:
        uiLang === 'hi'
          ? 'नमस्ते! मैं जनसेवा AI हूँ। आप दिल्ली के सांसदों, MPLADS विकास कार्यों या नागरिक अधिकार क्षेत्र (MP vs MLA vs MCD) पर कोई भी सवाल पूछ सकते हैं।'
          : 'Hi! I am JanSeva AI. Ask me about Delhi MPs, MPLADS fund utilization, or civic jurisdiction (MP vs MLA vs MCD).',
    },
  ]);

  // If already on the dedicated /chat page, do not show the floating popup
  if (pathname === '/chat') {
    return null;
  }

  // Derive MP context from URL if on an MP page (e.g. /mp/new-delhi)
  const isMpPage = pathname.startsWith('/mp/');
  const currentMpSlug = isMpPage ? pathname.replace('/mp/', '') : undefined;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const newMsgs = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const historyPayload: ChatMessage[] = newMsgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          lang: uiLang === 'hi' ? 'hi' : 'en',
          mpContext: currentMpSlug,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'No response available.',
          sources: data.sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to process query right now. Please view the full report card directly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-amber-400/30"
          aria-label="Open Chat with AI"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-sans font-semibold tracking-tight">
            {uiLang === 'hi' ? 'AI से पूछें' : 'Chat with AI'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}

      {/* Slide-out / Floating Chat Drawer Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[400px] h-[520px] bg-white dark:bg-[#0D121F] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#1E2636] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-amber-500/10 dark:bg-amber-400/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>JanSeva AI</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Verified
                  </span>
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Powered by Meko Data & Gemini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/chat"
                title="Open Full Page Chat"
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-[#1E2636] rounded-md transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-[#1E2636] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs sm:text-sm">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-amber-500 text-white rounded-tr-none'
                        : 'bg-stone-100 dark:bg-[#161D2A] text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-[#222E42] rounded-tl-none'
                    }`}
                  >
                    {m.content}
                    {!isUser && m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-200/40 dark:border-[#222E42] flex flex-wrap gap-1 text-[10px] text-stone-500 dark:text-stone-400">
                        {m.sources.map((s, sIdx) => (
                          <span key={sIdx} className="bg-stone-200/60 dark:bg-[#1E2636] px-1.5 py-0.5 rounded">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div className="w-6 h-6 rounded-md bg-stone-700 text-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-2 justify-start items-center text-xs text-stone-500 dark:text-stone-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Searching Meko Data & Gemini...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-3 py-1.5 bg-stone-50 dark:bg-[#0B0F1A] border-t border-stone-100 dark:border-[#1E2636] flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setInput('How much MPLADS fund has been spent?');
              }}
              className="text-[11px] whitespace-nowrap bg-stone-200/70 hover:bg-amber-500/10 dark:bg-[#161D2A] dark:hover:bg-amber-400/10 text-stone-700 dark:text-stone-300 px-2 py-1 rounded-md transition-colors"
            >
              MPLADS Spent?
            </button>
            <button
              type="button"
              onClick={() => {
                setInput('What are the declared affidavit details?');
              }}
              className="text-[11px] whitespace-nowrap bg-stone-200/70 hover:bg-amber-500/10 dark:bg-[#161D2A] dark:hover:bg-amber-400/10 text-stone-700 dark:text-stone-300 px-2 py-1 rounded-md transition-colors"
            >
              Affidavits?
            </button>
            <button
              type="button"
              onClick={() => {
                setInput('Who handles sanitation: MP or MCD?');
              }}
              className="text-[11px] whitespace-nowrap bg-stone-200/70 hover:bg-amber-500/10 dark:bg-[#161D2A] dark:hover:bg-amber-400/10 text-stone-700 dark:text-stone-300 px-2 py-1 rounded-md transition-colors"
            >
              MP vs MCD?
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white dark:bg-[#0D121F] border-t border-stone-200 dark:border-[#1E2636] flex items-center gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm bg-stone-100 dark:bg-[#161D2A] text-stone-900 dark:text-stone-100 px-3 py-2 rounded-lg border border-stone-200 dark:border-[#222E42] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
