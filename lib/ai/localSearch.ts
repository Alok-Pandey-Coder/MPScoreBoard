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

interface AcMappingRecord {
  ac_no: string;
  ac_name: string;
  pc_name: string;
  mp_name?: string;
  mp_party?: string;
  mla_name?: string;
  party?: string;
}

// In-memory cached registries
let cachedWorks: LocalWorkRecord[] | null = null;
let cachedAcMapping: AcMappingRecord[] | null = null;

const STOP_WORDS = new Set([
  // Auxiliary & grammatical
  'what', 'have', 'done', 'they', 'around', 'task', 'handling', 'this', 'that', 'with', 'about',
  'which', 'where', 'when', 'there', 'their', 'these', 'those', 'under', 'from', 'into', 'been',
  'being', 'more', 'some', 'many', 'much', 'tell', 'show', 'give', 'find', 'know', 'list',
  'please', 'recent', 'recently', 'good', 'best', 'worst', 'help', 'need', 'were', 'will',
  'could', 'would', 'should', 'also', 'just', 'like', 'than', 'them', 'then', 'very',
  // Generic domain words that appear in nearly all works or are not localities
  'work', 'works', 'project', 'projects', 'local', 'area', 'areas', 'city', 'delhi', 'fund',
  'funds', 'mplad', 'mplads', 'scheme', 'schemes', 'development', 'public', 'status', 'cost',
  'constituency', 'assembly', 'parliament', 'ward', 'zone', 'minister', 'councillor', 'corporation',
]);

function cleanName(name: string): string {
  return name.toLowerCase().replace(/\s*\((sc|st)\)\s*/gi, '').trim();
}

function compactName(name: string): string {
  return cleanName(name).replace(/[^a-z0-9]/g, '');
}

function loadData() {
  if (cachedWorks && cachedAcMapping) return;

  // 1. Load MPLADS works
  try {
    const rawDir = path.join(process.cwd(), 'data', 'raw');
    let rawPath = path.join(rawDir, 'mplads.delhi.empoweredindian.2026-10-31.json');

    // Dynamically pick the latest capture if available
    if (fs.existsSync(rawDir)) {
      const candidates = fs.readdirSync(rawDir)
        .filter((f) => f.startsWith('mplads.delhi.empoweredindian.') && f.endsWith('.json'))
        .sort();
      if (candidates.length > 0) {
        rawPath = path.join(rawDir, candidates[candidates.length - 1]);
      }
    }

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

  // 2. Load MLA & AC mappings via resilient tiered loading
  try {
    const regionalPath = path.join(process.cwd(), 'data', 'processed', 'delhi_regional_hierarchy.json');
    const mappingList: AcMappingRecord[] = [];

    // Tier 1: Canonical processed hierarchy (all 70 Delhi MLAs with sitting MP)
    if (fs.existsSync(regionalPath)) {
      try {
        const pcs = JSON.parse(fs.readFileSync(regionalPath, 'utf-8'));
        if (Array.isArray(pcs)) {
          for (const pc of pcs) {
            const pcName = pc.parliamentary_constituency || 'Delhi';
            const mpName = pc.mp_name || undefined;
            const mpParty = pc.mp_party || undefined;
            for (const mla of pc.mlas || []) {
              if (mla.assembly_constituency) {
                mappingList.push({
                  ac_no: String(mla.ac_number || ''),
                  ac_name: mla.assembly_constituency,
                  pc_name: pcName,
                  mp_name: mpName,
                  mp_party: mpParty,
                  mla_name: mla.mla_name || undefined,
                  party: mla.party || undefined,
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('[LocalSearch] Failed to parse delhi_regional_hierarchy.json:', e);
      }
    }

    // Tier 2: Reference pack data/reference_packs/delhi_mla_data_2026-11-01/
    if (mappingList.length === 0) {
      const rosterCsvPath = path.join(process.cwd(), 'data', 'reference_packs', 'delhi_mla_data_2026-11-01', 'mla_roster.csv');
      const acMapCsvPath = path.join(process.cwd(), 'data', 'reference_packs', 'delhi_mla_data_2026-11-01', 'ac_to_pc_mapping.csv');

      const acToPc: Record<string, string> = {};
      if (fs.existsSync(acMapCsvPath)) {
        const mapLines = fs.readFileSync(acMapCsvPath, 'utf-8').split('\n');
        for (const line of mapLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 4) {
            acToPc[compactName(parts[1])] = parts[3].trim();
          }
        }
      }

      if (fs.existsSync(rosterCsvPath)) {
        const mlaLines = fs.readFileSync(rosterCsvPath, 'utf-8').split('\n');
        for (const line of mlaLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 6) {
            const acNo = parts[0].trim();
            const acName = parts[1].trim();
            const mlaName = parts[3].trim();
            const party = parts[5].trim();
            const pc = acToPc[compactName(acName)] || 'Delhi';
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
    }

    // Tier 3: Reference pack officials_enriched_pack & delhi_jurisdiction_collection_01
    if (mappingList.length === 0) {
      const rosterCsvPath = path.join(process.cwd(), 'data', 'reference_packs', 'officials_enriched_pack', 'data', 'mla_constituency_roster.csv');
      const acMapCsvPath = path.join(process.cwd(), 'data', 'reference_packs', 'delhi_jurisdiction_collection_01', 'assembly_to_parliamentary_mapping.csv');

      const acToPc: Record<string, string> = {};
      if (fs.existsSync(acMapCsvPath)) {
        const mapLines = fs.readFileSync(acMapCsvPath, 'utf-8').split('\n');
        for (const line of mapLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 4) {
            acToPc[compactName(parts[1])] = parts[3].trim();
          }
        }
      }

      if (fs.existsSync(rosterCsvPath)) {
        const mlaLines = fs.readFileSync(rosterCsvPath, 'utf-8').split('\n');
        for (const line of mlaLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 4) {
            const acNo = parts[0].trim();
            const acName = parts[1].trim();
            const mlaName = parts[2].trim();
            const party = parts[3].trim();
            const pc = acToPc[compactName(acName)] || 'Delhi';
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
    }

    // Tier 4: Legacy meko_datapack (local dev fallback)
    if (mappingList.length === 0) {
      const mlaPath = path.join(process.cwd(), 'meko_datapack', '07_delhi_mla_roster.csv');
      const mapPath = path.join(process.cwd(), 'meko_datapack', '03_delhi_assembly_to_parliament_mapping.csv');

      const acToPc: Record<string, string> = {};
      if (fs.existsSync(mapPath)) {
        const mapLines = fs.readFileSync(mapPath, 'utf-8').split('\n');
        for (const line of mapLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            acToPc[compactName(parts[0])] = parts[1].trim();
          }
        }
      }

      if (fs.existsSync(mlaPath)) {
        const mlaLines = fs.readFileSync(mlaPath, 'utf-8').split('\n');
        for (const line of mlaLines.slice(1)) {
          const parts = line.split(',');
          if (parts.length >= 6) {
            const acNo = parts[0].trim();
            const acName = parts[1].trim();
            const mlaName = parts[3].trim();
            const party = parts[5].trim();
            const pc = acToPc[compactName(acName)] || 'Delhi';
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
  const qCompact = compactName(query);
  const chunks: MekoKnowledgeChunk[] = [];

  const matchedAcs: AcMappingRecord[] = [];
  const matchedPcNames = new Set<string>();
  const matchedLocalities = new Set<string>();

  // Match AC / MLA records
  if (cachedAcMapping) {
    for (const item of cachedAcMapping) {
      const acLower = item.ac_name.toLowerCase();
      const cleanAc = cleanName(item.ac_name);
      const compactAc = compactName(item.ac_name);
      const mlaLower = item.mla_name ? item.mla_name.toLowerCase() : '';
      const mlaClean = mlaLower.replace(/^(shri|smt|dr|km)\.?\s+/i, '').trim();

      // Check name match against AC, clean AC, compact AC, or MLA name
      const matchesAc =
        (cleanAc.length > 3 && (q.includes(acLower) || q.includes(cleanAc))) ||
        (compactAc.length > 4 && qCompact.includes(compactAc)) ||
        (cleanAc === 'narela' && (q.includes('nerela') || qCompact.includes('nerela')));

      const matchesMla =
        (mlaClean.length > 3 && (q.includes(mlaLower) || q.includes(mlaClean))) ||
        (mlaClean.includes(' ') &&
          mlaClean
            .split(/\s+/)
            .filter((p) => p.length > 4 && !['kumar', 'singh', 'sharma', 'gupta'].includes(p))
            .some((part) => q.includes(part)));

      if (matchesAc || matchesMla) {
        matchedAcs.push(item);
        matchedPcNames.add(cleanName(item.pc_name));
        matchedLocalities.add(cleanAc);
      }

      // Check if Parliamentary Constituency is explicitly referenced
      const pcClean = cleanName(item.pc_name);
      if (pcClean.length > 4 && q.includes(pcClean)) {
        matchedPcNames.add(pcClean);
      }
    }
  }

  // Generate chunks for matched assembly constituencies (up to 5 records, not breaking after 1)
  for (const item of matchedAcs.slice(0, 5)) {
    const mpInfo = item.mp_name ? `\n- Sitting Lok Sabha MP: ${item.mp_name} (${item.mp_party || 'MP'})` : '';
    chunks.push({
      id: `local-mla-${item.ac_no}`,
      chunk_text: `Delhi Civic Jurisdiction Record:
- Assembly Constituency: AC-${item.ac_no} ${item.ac_name}
- Member of Legislative Assembly (MLA): ${item.mla_name || 'Not reported'} (${item.party || 'Independent'})
- Parent Lok Sabha Parliamentary Constituency: ${item.pc_name}${mpInfo}
- Municipal Responsibility: Municipal Corporation of Delhi (MCD) local zone & ward councillors handle sanitation, neighborhood parks, and street cleaning.`,
      rerank_score: 0.98,
    });
  }

  // Match specific works in the queried locality / constituency
  if (cachedWorks && cachedWorks.length > 0) {
    const queryTokens = q
      .replace(/[?.,!/\\()"-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    const hasLocality = matchedLocalities.size > 0;
    const hasPc = matchedPcNames.size > 0;

    const scoredMatches: Array<{ record: LocalWorkRecord; score: number }> = [];

    for (const w of cachedWorks) {
      const descLower = w.description.toLowerCase();
      const constClean = cleanName(w.constituency);
      let score = 0;

      if (hasLocality) {
        // Query mentions a specific locality/AC: prioritize works in that locality
        let localityMatched = false;
        for (const loc of matchedLocalities) {
          if (descLower.includes(loc)) {
            score += 100;
            localityMatched = true;
            break;
          }
        }
        if (!localityMatched) {
          // If not in description, check if work is at least in the parent PC
          for (const pc of matchedPcNames) {
            if (constClean.includes(pc) || pc.includes(constClean)) {
              score += 40;
              break;
            }
          }
        }
      } else if (hasPc) {
        // Query mentions PC directly
        for (const pc of matchedPcNames) {
          if (constClean.includes(pc) || pc.includes(constClean)) {
            score += 60;
            break;
          }
        }
      } else if (queryTokens.length > 0) {
        // General query without locality: match topic tokens in description
        for (const term of queryTokens) {
          if (descLower.includes(term)) {
            score += 20;
          }
        }
      }

      // Topic specificity bonus if work is already eligible
      if (score > 0 && queryTokens.length > 0) {
        for (const term of queryTokens) {
          if (!matchedLocalities.has(term) && descLower.includes(term)) {
            score += 25;
          }
        }
      }

      if (score > 0) {
        scoredMatches.push({ record: w, score });
      }
    }

    if (scoredMatches.length > 0) {
      scoredMatches.sort((a, b) => b.score - a.score);

      const topWorks = scoredMatches.slice(0, 8).map((m) => m.record);
      const worksListText = topWorks
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
