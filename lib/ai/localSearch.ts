import 'server-only';
import fs from 'fs';
import path from 'path';
import type { MekoKnowledgeChunk } from './meko';

interface LocalWorkRecord {
  work_id: string;
  description: string;
  category: string;
  status: string;
  agency?: string;
  cost_display?: string;
  recommended_on?: string;
  completed_on?: string;
  constituency: string;
}

// In-memory cached registries
let cachedWorks: LocalWorkRecord[] | null = null;
let cachedAcMapping: Array<{ ac_no: string; ac_name: string; pc_name: string; mla_name?: string; party?: string }> | null = null;

function loadData() {
  if (cachedWorks && cachedAcMapping) return;

  try {
    const rawPath = path.join(process.cwd(), 'data', 'raw', 'mplads.delhi.empoweredindian.2026-10-31.json');
    if (fs.existsSync(rawPath)) {
      const raw = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
      const records = raw.records || [];
      const list: LocalWorkRecord[] = [];
      for (const rec of records) {
        const pc = rec.constituency || 'Delhi';
        for (const w of rec.works || []) {
          const finalAmt = w.finalAmount ?? w.final_amount_rupees;
          const recAmt = w.recommendedAmount ?? w.recommended_amount_rupees;
          const costStr = finalAmt
            ? `₹${(finalAmt / 100000).toFixed(2)} Lakh`
            : recAmt
            ? `₹${(recAmt / 100000).toFixed(2)} Lakh`
            : 'Not reported';

          const desc = w.workDescription || w.description || w.title || '';
          const wid = w.workId ? String(w.workId) : String(w.work_id || '');

          if (desc && wid) {
            list.push({
              work_id: wid,
              description: desc,
              category: w.workCategory || w.category || 'Local Works',
              status: w.status || 'Reported',
              agency: w.ida || w.agency || w.implementing_agency,
              cost_display: costStr,
              recommended_on: w.recommended_on || w.date,
              completed_on: w.completedDate || w.completed_on,
              constituency: pc,
            });
          }
        }
      }
      cachedWorks = list;
    }
  } catch (err) {
    console.warn('[LocalSearch] Failed to load local works:', err);
    cachedWorks = [];
  }

  // Load MLA & AC mappings
  try {
    const mlaPath = path.join(process.cwd(), 'meko_datapack', '07_delhi_mla_roster.csv');
    const mapPath = path.join(process.cwd(), 'meko_datapack', '03_delhi_assembly_to_parliament_mapping.csv');
    
    const acToPc: Record<string, string> = {};
    if (fs.existsSync(mapPath)) {
      const mapLines = fs.readFileSync(mapPath, 'utf-8').split('\n');
      for (const line of mapLines.slice(1)) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          acToPc[parts[0].trim().toLowerCase()] = parts[1].trim();
        }
      }
    }

    const mappingList: Array<{ ac_no: string; ac_name: string; pc_name: string; mla_name?: string; party?: string }> = [];
    if (fs.existsSync(mlaPath)) {
      const mlaLines = fs.readFileSync(mlaPath, 'utf-8').split('\n');
      for (const line of mlaLines.slice(1)) {
        const parts = line.split(',');
        if (parts.length >= 6) {
          const acNo = parts[0].trim();
          const acName = parts[1].trim();
          const mlaName = parts[3].trim();
          const party = parts[5].trim();
          const pc = acToPc[acName.toLowerCase()] || 'Delhi';
          mappingList.push({
            ac_no: acNo,
            ac_name: acName,
            pc_name: pc,
            mla_name: mlaName,
            party,
          });
        }
      }
    }
    cachedAcMapping = mappingList;
  } catch (err) {
    console.warn('[LocalSearch] Failed to load AC mappings:', err);
    cachedAcMapping = [];
  }
}

export function searchLocalCivicRecords(query: string): MekoKnowledgeChunk[] {
  loadData();
  const q = query.toLowerCase();
  const chunks: MekoKnowledgeChunk[] = [];

  // Match AC / MLA records
  if (cachedAcMapping) {
    for (const item of cachedAcMapping) {
      const acLower = item.ac_name.toLowerCase();
      if (q.includes(acLower) || (acLower.length > 3 && q.includes(acLower))) {
        chunks.push({
          id: `local-mla-${item.ac_no}`,
          chunk_text: `Delhi Civic Jurisdiction Record:
- Assembly Constituency: AC-${item.ac_no} ${item.ac_name}
- Member of Legislative Assembly (MLA): ${item.mla_name} (${item.party})
- Parent Lok Sabha Parliamentary Constituency: ${item.pc_name}
- Municipal Responsibility: Municipal Corporation of Delhi (MCD) local zone & ward councillors handle sanitation, neighborhood parks, and street cleaning.`,
          rerank_score: 0.98,
        });
        break;
      }
    }
  }

  // Match specific works in the queried locality (e.g. Rohini, Dwarka, Karol Bagh, etc.)
  if (cachedWorks) {
    const words = q
      .replace(/[?.,!]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['what', 'have', 'done', 'they', 'around', 'task', 'handling', 'this', 'that', 'with', 'about'].includes(w));

    const matches: LocalWorkRecord[] = [];
    for (const w of cachedWorks) {
      const descLower = w.description.toLowerCase();
      if (words.some((term) => descLower.includes(term))) {
        matches.push(w);
      }
    }

    if (matches.length > 0) {
      const worksListText = matches
        .slice(0, 8)
        .map(
          (m, i) =>
            `${i + 1}. Work ID #${m.work_id} [${m.status.toUpperCase()}]: ${m.description} | Cost: ${m.cost_display} | Constituency: ${m.constituency}${m.completed_on ? ` | Completed: ${m.completed_on.split('T')[0]}` : ''}${m.agency ? ` | Agency: ${m.agency}` : ''}`,
        )
        .join('\n\n');

      chunks.push({
        id: 'local-mplads-matches',
        chunk_text: `Recent Specific MPLADS Development Works in this area (Source: MoSPI eSAKSHI & Empowered Indian):\n\n${worksListText}`,
        rerank_score: 0.99,
      });
    }
  }

  return chunks;
}
