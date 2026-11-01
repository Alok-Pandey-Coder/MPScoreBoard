import { NextRequest, NextResponse } from 'next/server';
import { searchMekoKnowledgeBase } from '@/lib/ai/meko';
import { searchLocalCivicRecords } from '@/lib/ai/localSearch';
import { generateChatResponse, type ChatMessage } from '@/lib/ai/chat';
import { isAiLang, type AiLang } from '@/lib/ai/summary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Invalid request: "message" is required as a non-empty string.' },
        { status: 400 },
      );
    }

    const message = body.message.trim();
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 1000 characters.' },
        { status: 400 },
      );
    }

    const lang: AiLang = isAiLang(body.lang) ? body.lang : 'en';
    const mpContext: string | undefined = typeof body.mpContext === 'string' ? body.mpContext.slice(0, 100) : undefined;
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter((item: any) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
          .slice(-6)
      : [];

    // Step 1: Query Meko MCP for knowledge chunks (retrieve top 8 for depth)
    const mekoChunks = await searchMekoKnowledgeBase(message, 8);

    // Step 2: Query local structured records (specific works, MLA roster, AC mapping)
    const localChunks = searchLocalCivicRecords(message);

    // Combine chunks with local chunks prioritized for hyper-local precision
    const combinedChunks = [...localChunks, ...mekoChunks];

    // Step 3: Grounded generation via Google Gemini
    const result = await generateChatResponse(message, history, combinedChunks, lang, mpContext);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/chat] Error handling chat request:', error);
    return NextResponse.json(
      { error: 'Internal server error processing civic inquiry.' },
      { status: 500 },
    );
  }
}
