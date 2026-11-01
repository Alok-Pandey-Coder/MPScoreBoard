'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  Database,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import type { AiLang } from '@/lib/ai/summary';
import type { ChatMessage, ChatSourceCitation } from '@/lib/ai/chat';

interface ExtendedMessage extends ChatMessage {
  id: string;
  sources?: ChatSourceCitation[];
  chunksUsed?: number;
  model?: string;
  suggestedFollowUps?: string[];
}

interface ChatClientProps {
  initialMpSlug?: string;
}

const PRESET_QUERIES: Array<{ label: string; text: string; category: string }> = [
  {
    label: 'MPLADS Spending',
    text: "How much of their MPLADS development fund has Bansuri Swaraj spent so far?",
    category: 'MPLADS',
  },
  {
    label: 'MP vs MLA vs MCD',
    text: 'My neighborhood streetlights and drainage are broken. Should I contact my MP, MLA, or MCD councillor?',
    category: 'Jurisdiction',
  },
  {
    label: 'Affidavit Declarations',
    text: 'What are the declared assets and criminal case declarations for Manoj Tiwari?',
    category: 'Affidavit',
  },
  {
    label: 'Parliament Attendance',
    text: 'What is Praveen Khandelwal’s attendance in the 18th Lok Sabha compared to the Delhi average?',
    category: 'Parliament',
  },
];

const DELHI_MPS = [
  { slug: '', name: 'All 7 Delhi Parliamentary Seats' },
  { slug: 'new-delhi', name: 'New Delhi — Bansuri Swaraj' },
  { slug: 'north-east-delhi', name: 'North East Delhi — Manoj Tiwari' },
  { slug: 'chandni-chowk', name: 'Chandni Chowk — Praveen Khandelwal' },
  { slug: 'east-delhi', name: 'East Delhi — Harsh Malhotra' },
  { slug: 'south-delhi', name: 'South Delhi — Ramvir Singh Bidhuri' },
  { slug: 'west-delhi', name: 'West Delhi — Kamaljeet Sehrawat' },
  { slug: 'north-west-delhi', name: 'North West Delhi — Yogender Chandoliya' },
];

export const ChatClient: React.FC<ChatClientProps> = ({ initialMpSlug = '' }) => {
  const { lang: uiLang } = useLang();
  const [lang, setLang] = useState<AiLang>(uiLang === 'hi' ? 'hi' : 'en');
  const [selectedMp, setSelectedMp] = useState<string>(initialMpSlug);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        uiLang === 'hi'
          ? 'नमस्ते! मैं जनसेवा AI हूँ — आपका निष्पक्ष नागरिक सहायक। आप दिल्ली के सांसदों, MPLADS निधि खर्च, चुनावी हलफ़नामों और नागरिक अधिकार क्षेत्रों (सांसद बनाम विधायक बनाम निगम पार्षद) के बारे में कोई भी सवाल पूछ सकते हैं।\n\nसभी उत्तर Meko Data के सत्यापित रिकॉर्ड और आधिकारिक स्रोतों (PRS, MoSPI eSAKSHI, ECI) पर आधारित होते हैं।'
          : 'Welcome! I am JanSeva AI — your neutral Delhi civic assistant.\n\nAsk me anything about Delhi Lok Sabha MPs, MPLADS fund utilization, election affidavit declarations, or civic jurisdictions (MP vs MLA vs MCD councillor).\n\nAll responses are grounded directly in official public records from PRS Legislative Research, MoSPI eSAKSHI, and Election Commission of India affidavits.',
      sources: [
        { name: 'PRS Legislative Research', category: 'Parliament', url: 'https://prsindia.org' },
        { name: 'MoSPI eSAKSHI & Empowered Indian', category: 'MPLADS', url: 'https://empoweredindian.in/mplads' },
        { name: 'ECI Form 26 Sworn Affidavits', category: 'Affidavit', url: 'https://www.myneta.info' },
      ],
      chunksUsed: 1,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText ?? input).trim();
    if (!textToSend || loading) return;

    setInput('');
    const userMsgId = Date.now().toString();
    const newMessages: ExtendedMessage[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: textToSend },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historyPayload: ChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          lang,
          mpContext: selectedMp || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || 'No response generated.',
          sources: data.sources || [],
          chunksUsed: data.chunksUsed ?? 0,
          model: data.model,
          suggestedFollowUps: data.suggestedFollowUps || [],
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            lang === 'hi'
              ? 'क्षमा करें, प्रतिक्रिया उत्पन्न करने में समस्या आई। कृपया पुनः प्रयास करें या सीधे सांसद रिपोर्ट कार्ड देखें।'
              : 'Sorry, we encountered a temporary issue generating a response. Please try again or inspect the verified records on the report card directly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-400/10 dark:via-transparent border border-amber-500/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight font-sans">
                  {lang === 'hi' ? 'जनसेवा AI — नागरिक संवाद' : 'Chat with AI — JanSeva Civic Assistant'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Grounded & Non-partisan
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                {lang === 'hi'
                  ? 'संसद, MPLADS और ईसीआई रिकॉर्ड्स से जुड़े सवालों के सत्यापित जवाब पाएं।'
                  : 'Ask verified questions powered by Google Gemini & Meko Data knowledge base.'}
              </p>
            </div>
          </div>

          {/* Controls: Language and MP Focus */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg bg-stone-200/80 dark:bg-[#1A2333] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === 'en'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === 'hi'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLang('hinglish')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === 'hinglish'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Hinglish
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-[#1A2333] rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MP Context Selector */}
        <div className="mt-4 pt-3 border-t border-amber-500/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 dark:text-stone-400 font-medium">Focus MP / Seat:</span>
          <select
            value={selectedMp}
            onChange={(e) => setSelectedMp(e.target.value)}
            className="bg-white dark:bg-[#161D2A] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-[#222E42] rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs"
          >
            {DELHI_MPS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
          {selectedMp && (
            <Link
              href={`/mp/${selectedMp}`}
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-semibold ml-auto"
            >
              View Full Report Card <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Preset Suggestions Chips */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
          Suggested Citizen Inquiries:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q.text)}
              className="text-left text-xs bg-stone-100 hover:bg-amber-500/10 dark:bg-[#161D2A] dark:hover:bg-amber-400/10 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200/80 dark:border-[#222E42] hover:border-amber-500/30 rounded-xl px-3 py-1.5 transition-all duration-150 disabled:opacity-50"
            >
              <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1.5">
                [{q.category}]
              </span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="rounded-2xl border border-stone-200 dark:border-[#1E2636] bg-white dark:bg-[#0D121F] shadow-sm flex flex-col h-[520px] sm:h-[580px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 shadow-sm text-sm sm:text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-white rounded-tr-none'
                      : 'bg-stone-50 dark:bg-[#151C2C] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-[#202A3C] rounded-tl-none'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {m.content}
                  </div>

                  {/* Sources & Citations Footer for Assistant */}
                  {!isUser && m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-[#222E42]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Verified Public Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-[#1E2636] text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-[#2C384D]"
                          >
                            <span>{src.name}</span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 dark:text-amber-400 hover:underline"
                                title={`Open ${src.name}`}
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Followups Chips */}
                  {!isUser && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
                      {m.suggestedFollowUps.map((followUp, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          disabled={loading}
                          onClick={() => handleSend(followUp)}
                          className="text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md px-2 py-1 transition-colors border border-amber-500/20 text-left"
                        >
                          → {followUp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-stone-800 dark:bg-stone-700 text-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-50 dark:bg-[#151C2C] border border-stone-200/80 dark:border-[#202A3C] rounded-2xl rounded-tl-none p-4 text-sm text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                <span>Searching Meko Data & reasoning with Gemini...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-50/80 dark:bg-[#0B0F1A] border-t border-stone-200 dark:border-[#1E2636]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === 'hi'
                  ? 'दिल्ली के सांसदों, विकास निधि या नागरिक अधिकार क्षेत्र पर सवाल पूछें...'
                  : 'Ask about Delhi MPs, MPLADS funds, or civic jurisdictions...'
              }
              disabled={loading}
              className="flex-1 bg-white dark:bg-[#161D2A] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 text-sm sm:text-base px-4 py-2.5 sm:py-3 rounded-xl border border-stone-200 dark:border-[#222E42] focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Non-partisan Disclaimer */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              Neutral & non-partisan. Grounded via Meko Data MCP & Google Gemini.
            </span>
            <span className="hidden sm:inline">All 7 Delhi Parliamentary Seats</span>
          </div>
        </div>
      </div>
    </div>
  );
};
