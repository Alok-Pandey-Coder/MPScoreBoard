import 'server-only';
import type { MPRecord } from '@/types/mp';
import { SYSTEM_PROMPT_SUMMARY } from './prompts';
import { containsBannedWords, verifyGuardrails, type AiLang } from './summary';

const TIMEOUT_MS = 8000;

const LANGUAGE_INSTRUCTION: Record<AiLang, string> = {
  en: 'simple English',
  hi: 'Hindi in Devanagari script, simple everyday words (digits 0-9)',
  hinglish: 'Hinglish (Hindi in Roman script mixed with English)',
};

/**
 * The structured facts the model may use: identity, the four indicators with
 * their PRS averages, and MPLADS totals. No free text from users.
 */
function summaryFacts(mp: MPRecord) {
  const p = mp.performance;
  const m = mp.mplads?.status === 'reported' ? mp.mplads : null;
  return {
    name: mp.name,
    constituency: mp.constituency,
    state: mp.state,
    term: mp.term,
    is_minister: mp.is_minister,
    performance:
      p.status === 'reported'
        ? {
            attendance_pct: p.attendance_pct,
            debates: p.debates,
            questions: p.questions,
            private_member_bills: p.private_member_bills,
            as_of: p.as_of ?? null,
            state_average: p.prs_averages?.state ?? null,
            national_average: p.prs_averages?.national ?? null,
          }
        : { status: p.status },
    mplads: m
      ? {
          allocated_crore: m.allocated_cr ?? null,
          spent_crore: m.expenditure_cr ?? null,
          spent_pct_of_allocated: m.expenditure_pct ?? null,
          works_recommended: m.works_count?.recommended ?? null,
          works_completed: m.works_count?.completed ?? null,
          as_of: m.as_of ?? null,
        }
      : null,
  };
}

/**
 * Asks Gemini for a 3–4 sentence summary. Returns null on a missing key or
 * model, timeout, HTTP error, empty output, or any guardrail failure; the
 * caller then uses the deterministic template.
 */
export async function generateLlmSummary(mp: MPRecord, lang: AiLang): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  if (!apiKey || !model) return null;

  const language = LANGUAGE_INSTRUCTION[lang];
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT_SUMMARY}\nOutput language: ${language}.` }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(summaryFacts(mp)) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
    if (!text || containsBannedWords(text) || !verifyGuardrails(text, mp)) return null;
    return text;
  } catch {
    return null;
  }
}
