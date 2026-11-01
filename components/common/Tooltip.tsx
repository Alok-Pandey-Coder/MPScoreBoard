'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useMessages } from '@/context/LanguageContext';
import { commonMessages } from '@/lib/messages/common';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const t = useMessages(commonMessages);

  return (
    <span className="relative inline-flex items-center group">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors ml-1 p-0.5 rounded"
        aria-label={t.moreInfo}
      >
        {children || <HelpCircle className="w-3.5 h-3.5" />}
      </button>

      {isVisible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-normal text-left"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};

