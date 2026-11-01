import 'server-only';
import { randomUUID } from 'crypto';

export interface MekoKnowledgeChunk {
  id: string;
  chunk_text: string;
  document_id?: string;
  match_type?: string;
  distance?: number;
  rerank_score?: number;
  rank?: number;
}

export interface MekoSearchResult {
  results: MekoKnowledgeChunk[];
  count: number;
}

const MEKO_MCP_ENDPOINT = process.env.MEKO_MCP_URL || 'https://mcp.mekodata.ai/mcp';
const DEFAULT_DATAPACK_ID = process.env.MEKO_DATAPACK_ID || '0200f6e7-2f14-4e60-91e9-717da105bcc7';
const TIMEOUT_MS = 6000;

/**
 * Searches the Meko Knowledge Base for the specified query using MCP tools/call.
 * Falls back gracefully if Meko credentials are not configured or request fails.
 */
export async function searchMekoKnowledgeBase(
  query: string,
  limit: number = 5,
  datapackId: string = DEFAULT_DATAPACK_ID,
): Promise<MekoKnowledgeChunk[]> {
  const token = process.env.meko_api || process.env.MEKO_API_KEY;
  if (!token) {
    return [];
  }

  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'knowledgebase_search',
      arguments: {
        query,
        datapack_id: datapackId,
        conversation_id: randomUUID(),
        limit,
      },
    },
  };

  try {
    const res = await fetch(MEKO_MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`[Meko MCP] Response returned status ${res.status}`);
      return [];
    }

    const raw = await res.text();
    // Parse SSE stream format
    for (const line of raw.split('\n')) {
      if (line.startsWith('data: ')) {
        const parsed = JSON.parse(line.slice(6));
        const content = parsed?.result?.content;
        if (Array.isArray(content) && content.length > 0 && typeof content[0]?.text === 'string') {
          const inner: MekoSearchResult = JSON.parse(content[0].text);
          return inner.results ?? [];
        }
      }
    }
    return [];
  } catch (error) {
    console.warn('[Meko MCP] Failed to retrieve knowledge chunks:', error);
    return [];
  }
}
