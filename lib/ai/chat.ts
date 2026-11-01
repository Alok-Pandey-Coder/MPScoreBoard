import 'server-only';
import { containsBannedWords, type AiLang } from './summary';
import type { MekoKnowledgeChunk } from './meko';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSourceCitation {
  name: string;
  category: 'Parliament' | 'MPLADS' | 'Affidavit' | 'Civic Jurisdiction' | 'MCD';
  description?: string;
  url?: string;
}

export interface ChatResponse {
  reply: string;
  sources: ChatSourceCitation[];
  chunksUsed: number;
  model: string;
  suggestedFollowUps: string[];
}

const LANGUAGE_INSTRUCTION: Record<AiLang, string> = {
  en: 'Respond in clear, neutral English.',
  hi: 'Respond in polite, everyday Hindi using Devanagari script (digits 0-9). Use respectful plural (e.g. सांसद हैं).',
  hinglish: 'Respond in conversational Hinglish (Hindi written in Roman script mixed with simple English words).',
};

const SYSTEM_PROMPT_CHAT = `You are "JanSeva AI" (जनसेवा AI), the neutral, verified civic assistant for "Mera MP, Mera Report Card" (18th Lok Sabha, Delhi).

Your mission is to provide citizens with 100% factual, source-backed information about Members of Parliament (MPs), public funds (MPLADS), and Delhi civic jurisdictions (MP vs MLA vs MCD).

STRICT CIVIC RULES & NON-PARTISAN GUARDRAILS:
1. Neutrality: Maintain a completely non-partisan, respectful, and objective tone. Never praise, condemn, defend, or attack any political party or politician.
2. No Rankings or Judgments: Never rank MPs or call any MP "best", "worst", "lazy", "failed", "useless", or "criminal MP" (or Hindi equivalents: "सबसे अच्छा", "सबसे खराब", "आलसी", "नाकाम", "बेकार", "आपराधिक सांसद").
3. Allegations vs Convictions: Cases declared in election affidavits are allegations, never refer to them as convictions or proven guilt.
4. Ministers: Explain neutrally that Union Ministers do not sign daily attendance registers or table parliamentary questions under parliamentary procedure.
5. Verification: Base your answers ONLY on verified public facts provided in the knowledge context. If data is unavailable or not reported, state that neutrally as "Not reported" or "Information not available in official records"; never invent figures.
6. Sources: State the official source of facts (e.g., "Source: PRS Legislative Research", "Source: MoSPI eSAKSHI", "Source: ECI Form 26 Affidavit", "Source: MCD Wards Register").
7. Jurisdiction Clarity: If a citizen asks about a hyper-local civic problem (e.g., choked neighborhood drains, streetlights, garbage collection), clearly explain whether it falls under MCD Ward Councillor, Delhi MLA (Vidhan Sabha), or Lok Sabha MP.
8. Area & Project Inquiries: When a citizen asks who is handling tasks in a specific area (such as Rohini, Dwarka, Karol Bagh, etc.) or what has been done recently:
   - Identify the exact elected representatives at each tier:
     a) Lok Sabha MP (Name, Parliamentary Constituency, Party)
     b) Vidhan Sabha MLA (Name, Assembly Constituency, Party)
     c) Municipal Corporation of Delhi (MCD Zone and Ward Councillor role)
   - Explicitly list the specific recent development projects from the verified context (stating Work ID, project description, cost, and Completed or Recommended status). Never claim project records are unavailable when project items exist in the verified context.
`;

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

const TIMEOUT_MS = 10000;

export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[],
  chunks: MekoKnowledgeChunk[],
  lang: AiLang = 'en',
  mpContext?: string,
): Promise<ChatResponse> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  // Prepare context text
  const contextSnippet = chunks.length > 0
    ? chunks.map((c, i) => `[Verified Source Chunk ${i + 1}]\n${c.chunk_text}`).join('\n\n---\n\n')
    : 'No additional knowledge base chunks retrieved. Rely strictly on verified Delhi civic facts.';

  const langDirective = LANGUAGE_INSTRUCTION[lang];
  const contextDirective = mpContext ? `Citizen is currently inspecting MP: ${mpContext}.` : '';

  const systemText = `${SYSTEM_PROMPT_CHAT}\n${langDirective}\n${contextDirective}`;

  // Build conversational turns for Gemini API
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Recent conversation history (keep last 4 turns)
  const recentHistory = history.slice(-4);
  for (const h of recentHistory) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    });
  }

  // Current turn with grounded knowledge
  const promptWithContext = `Verified Knowledge Base Context:\n${contextSnippet}\n\nCitizen Question: ${userMessage}`;
  contents.push({
    role: 'user',
    parts: [{ text: promptWithContext }],
  });

  // Extract source citations from chunks
  const sources: ChatSourceCitation[] = [];
  const chunkStr = chunks.map((c) => c.chunk_text).join(' ');
  if (chunkStr.includes('Attendance') || chunkStr.includes('Debates') || chunkStr.includes('Questions')) {
    sources.push({
      name: 'PRS Legislative Research',
      category: 'Parliament',
      description: 'Parliamentary attendance, debates, and questions data',
      url: 'https://prsindia.org',
    });
  }
  if (chunkStr.includes('MPLADS') || chunkStr.includes('Allocated Funds') || chunkStr.includes('Expenditure') || chunkStr.includes('eSAKSHI')) {
    sources.push({
      name: 'MoSPI eSAKSHI / Empowered Indian',
      category: 'MPLADS',
      description: 'Member of Parliament Local Area Development Scheme records',
      url: 'https://empoweredindian.in/mplads',
    });
  }
  if (chunkStr.includes('affidavit') || chunkStr.includes('Movable') || chunkStr.includes('Criminal') || chunkStr.includes('myneta')) {
    sources.push({
      name: 'Election Commission of India / ADR MyNeta',
      category: 'Affidavit',
      description: 'Nomination Form 26 sworn affidavit declarations',
      url: 'https://www.myneta.info',
    });
  }
  if (chunkStr.includes('MCD') || chunkStr.includes('Ward') || chunkStr.includes('Assembly') || chunkStr.includes('MLA')) {
    sources.push({
      name: 'Delhi State Election Commission & MCD',
      category: 'Civic Jurisdiction',
      description: 'Assembly and MCD ward delimitations',
    });
  }

  if (sources.length === 0) {
    sources.push({
      name: 'Delhi Public Civic Master Dossier',
      category: 'Civic Jurisdiction',
      description: 'Verified 18th Lok Sabha Delhi Civic Records',
    });
  }

  // Suggest relevant follow up questions
  const suggestedFollowUps: string[] = [
    'How much of their MPLADS fund has been spent?',
    'What parliamentary debates or questions did they participate in?',
    'Who is responsible for local sanitation vs road infrastructure?',
  ];

  if (!apiKey) {
    return {
      reply: 'AI assistance is currently operating in offline mode. Please refer to the verified data cards on the website for attendance, MPLADS, and affidavit records.',
      sources,
      chunksUsed: chunks.length,
      model: 'offline',
      suggestedFollowUps,
    };
  }

  // Attempt candidate Gemini models
  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        continue;
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
      if (!reply) continue;

      // Ensure no banned words
      if (containsBannedWords(reply)) {
        console.warn('[JanSeva AI] Guardrail triggered on output tone.');
        return {
          reply: 'Here are the verified records from Parliament and official election affidavits. All indicators reflect official activity and statutory declarations without subjective ranking.',
          sources,
          chunksUsed: chunks.length,
          model,
          suggestedFollowUps,
        };
      }

      return {
        reply,
        sources,
        chunksUsed: chunks.length,
        model,
        suggestedFollowUps,
      };
    } catch {
      continue;
    }
  }

  // Fallback if all models timed out
  return {
    reply: 'Our AI civic service is currently experiencing high demand. You can inspect all verified statistics, attendance percentages, and MPLADS expenditure breakdowns directly on the report cards.',
    sources,
    chunksUsed: chunks.length,
    model: 'fallback',
    suggestedFollowUps,
  };
}
