import { searchMekoKnowledgeBase } from '../lib/ai/meko';
import { searchLocalCivicRecords } from '../lib/ai/localSearch';
import { generateChatResponse, type ChatMessage } from '../lib/ai/chat';
import { containsBannedWords, isAiLang } from '../lib/ai/summary';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/chat/route';

describe('JanSeva AI / Chat with AI Unit Tests', () => {
  describe('Local civic and hyper-local area search', () => {
    it('retrieves MLA and local MPLADS works when an area like Rohini is queried', () => {
      const chunks = searchLocalCivicRecords('who is handling all the task around rohini and what they have done recently');
      expect(chunks.length).toBeGreaterThan(0);
      const text = chunks.map(c => c.chunk_text).join(' ');
      expect(text.toLowerCase()).toContain('rohini');
      expect(text).toContain('Vijender Gupta');
      expect(text).toContain('Work ID #');
    });
  });

  describe('Language validation', () => {
    it('accepts valid AI languages', () => {
      expect(isAiLang('en')).toBe(true);
      expect(isAiLang('hi')).toBe(true);
      expect(isAiLang('hinglish')).toBe(true);
      expect(isAiLang('fr')).toBe(false);
      expect(isAiLang(123)).toBe(false);
    });
  });

  describe('Non-partisan tone & banned words check', () => {
    it('catches banned English subjective words', () => {
      expect(containsBannedWords('This is the best MP in Delhi.')).toBe(true);
      expect(containsBannedWords('He is the worst representative.')).toBe(true);
      expect(containsBannedWords('The criminal MP did not show up.')).toBe(true);
      expect(containsBannedWords('She attended 95% of sessions.')).toBe(false);
    });

    it('catches banned Hindi subjective words', () => {
      expect(containsBannedWords('यह सबसे अच्छा सांसद है')).toBe(true);
      expect(containsBannedWords('वे सबसे खराब प्रतिनिधि हैं')).toBe(true);
      expect(containsBannedWords('उपस्थिति 95% दर्ज की गई है।')).toBe(false);
    });
  });

  describe('Meko MCP search fallback', () => {
    it('returns empty array when token is not provided or network fails without crashing', async () => {
      const origToken = process.env.meko_api;
      delete process.env.meko_api;
      delete process.env.MEKO_API_KEY;

      const res = await searchMekoKnowledgeBase('test query');
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(0);

      if (origToken) process.env.meko_api = origToken;
    });
  });

  describe('API /api/chat contract', () => {
    it('rejects empty or missing message with 400 status', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '   ' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('rejects message exceeding 1000 characters', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'A'.repeat(1005) }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('exceeds maximum length');
    });

    it('returns structured reply and source citations for valid inquiry', async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'What is the attendance of Bansuri Swaraj?',
          lang: 'en',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reply).toBeDefined();
      expect(typeof data.reply).toBe('string');
      expect(Array.isArray(data.sources)).toBe(true);
      expect(data.sources.length).toBeGreaterThan(0);
      expect(Array.isArray(data.suggestedFollowUps)).toBe(true);
    });
  });
});
