import React from 'react';
import type { Metadata } from 'next';
import { ChatClient } from '@/components/chat/ChatClient';

export const metadata: Metadata = {
  title: 'Chat with AI — JanSeva Civic Assistant | Mera MP',
  description:
    'Ask questions grounded in verified records of Delhi MPs, MPLADS fund utilization, and civic jurisdictions (MP vs MLA vs MCD), powered by Meko Data MCP and Google Gemini.',
};

export default function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ mp?: string }>;
}) {
  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-[#0B0F1A] transition-colors">
      <ChatClient initialMpSlug="" />
    </main>
  );
}
