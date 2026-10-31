import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Load data files safely
const mpsPath = path.resolve(__dirname, '../data/processed/mps.json');
const geoPath = path.resolve(__dirname, '../frontend/src/data/delhiConstituenciesGeo.json');
const aliasesPath = path.resolve(__dirname, '../data/processed/aliases.json');

let mps = [];
let geoJSON = { features: [] };
let aliases = { mp: {}, constituency: {} };

try {
  mps = JSON.parse(fs.readFileSync(mpsPath, 'utf8'));
} catch (e) {
  console.warn('Could not load mps.json:', e.message);
}

try {
  geoJSON = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
} catch (e) {
  console.warn('Could not load geojson:', e.message);
}

try {
  aliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
} catch (e) {
  console.warn('Could not load aliases.json:', e.message);
}

// Delhi Pincodes Registry
const DELHI_PINCODES = {
  "110001": { pincode: "110001", area: "Connaught Place, Barakhamba Road", constituency_slug: "new-delhi-delhi", constituency_name: "New Delhi", lat: 28.6315, lng: 77.2167 },
  "110002": { pincode: "110002", area: "Daryaganj, Delhi Gate", constituency_slug: "chandni-chowk-delhi", constituency_name: "Chandni Chowk", lat: 28.6465, lng: 77.2410 },
  "110003": { pincode: "110003", area: "Aliganj, Lodhi Road, CGO Complex", constituency_slug: "new-delhi-delhi", constituency_name: "New Delhi", lat: 28.5878, lng: 77.2255 },
  "110006": { pincode: "110006", area: "Chandni Chowk, Sadar Bazar", constituency_slug: "chandni-chowk-delhi", constituency_name: "Chandni Chowk", lat: 28.6562, lng: 77.2307 },
  "110014": { pincode: "110014", area: "Jangpura, Nizamuddin East", constituency_slug: "east-delhi-delhi", constituency_name: "East Delhi", lat: 28.5823, lng: 77.2471 },
  "110018": { pincode: "110018", area: "Tilak Nagar, Khyala", constituency_slug: "west-delhi-delhi", constituency_name: "West Delhi", lat: 28.6366, lng: 77.0963 },
  "110019": { pincode: "110019", area: "Kalkaji, Nehru Place, CR Park", constituency_slug: "south-delhi-delhi", constituency_name: "South Delhi", lat: 28.5402, lng: 77.2538 },
  "110032": { pincode: "110032", area: "Shahdara, Mansarovar Park", constituency_slug: "north-east-delhi-delhi", constituency_name: "North East Delhi", lat: 28.6738, lng: 77.2885 },
  "110085": { pincode: "110085", area: "Rohini Sector 7-8", constituency_slug: "north-west-delhi-delhi", constituency_name: "North West Delhi (SC)", lat: 28.7100, lng: 77.1140 },
};

// Helper: send JSON with CORS
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// Request body parser helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 1. Health API (PRD 6.2)
  if (pathname === '/api/health') {
    return sendJSON(res, 200, {
      status: 'ok',
      service: 'Mera MP Parliamentary Intelligence Backend',
      snapshotDate: '2026-10-31',
      activeTerm: '18th Lok Sabha',
      mpsCount: mps.length,
      pincodesMapped: Object.keys(DELHI_PINCODES).length,
      uptime: process.uptime(),
    });
  }

  // 2. Search Index API (PRD 6.2)
  if (pathname === '/api/search-index') {
    const index = mps.map((m) => ({
      slug: m.slug,
      name: m.name,
      constituency: m.constituency,
      state: m.state,
      party: m.party,
      is_minister: m.is_minister,
      reservation: m.reservation,
    }));
    return sendJSON(res, 200, index);
  }

  // 3. Search Suggestions API
  if (pathname === '/api/search') {
    const q = (query.q || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      return sendJSON(res, 200, { suggestions: [] });
    }

    const suggestions = [];

    // Match MPs
    for (const mp of mps) {
      if (mp.name.toLowerCase().includes(q)) {
        suggestions.push({
          id: `mp-${mp.slug}`,
          type: 'mp',
          title: mp.name,
          subtitle: `Member of Parliament • ${mp.constituency} (${mp.party})`,
          slug: mp.slug,
        });
      }
    }

    // Match Constituencies
    for (const mp of mps) {
      if (mp.constituency.toLowerCase().includes(q) && !suggestions.some((s) => s.slug === mp.slug && s.type === 'constituency')) {
        suggestions.push({
          id: `const-${mp.slug}`,
          type: 'constituency',
          title: mp.constituency,
          subtitle: `18th Lok Sabha Constituency • MP: ${mp.name} (${mp.party})`,
          slug: mp.slug,
        });
      }
    }

    // Match Pincodes
    for (const [code, info] of Object.entries(DELHI_PINCODES)) {
      if (code.includes(q) || info.area.toLowerCase().includes(q)) {
        suggestions.push({
          id: `pin-${code}`,
          type: 'pincode',
          title: `${code} — ${info.area.split(',')[0]}`,
          subtitle: `Mapped to ${info.constituency_name} Constituency`,
          slug: info.constituency_slug,
          coords: { lat: info.lat, lng: info.lng },
        });
      }
    }

    return sendJSON(res, 200, { suggestions: suggestions.slice(0, 10) });
  }

  // 4. Constituencies List API
  if (pathname === '/api/constituencies') {
    const list = mps.map((m) => ({
      slug: m.slug,
      name: m.constituency,
      sittingMP: m.name,
      party: m.party,
      reservation: m.reservation,
      attendance: m.performance.attendance_pct,
      questions: m.performance.questions,
      debates: m.performance.debates,
    }));
    return sendJSON(res, 200, { constituencies: list });
  }

  // 5. Full MP Data API
  if (pathname === '/api/data') {
    const slug = query.slug;
    if (!slug) {
      return sendJSON(res, 200, mps);
    }
    const found = mps.find((m) => m.slug === slug);
    if (!found) {
      return sendJSON(res, 404, { error: 'MP not found' });
    }
    return sendJSON(res, 200, found);
  }

  // 6. Pincode Resolver API
  if (pathname === '/api/pincode') {
    const code = query.code;
    if (!code || !DELHI_PINCODES[code]) {
      return sendJSON(res, 404, { error: 'Delhi pincode not found' });
    }
    return sendJSON(res, 200, DELHI_PINCODES[code]);
  }

  // 7. GeoJSON API
  if (pathname === '/api/geojson') {
    return sendJSON(res, 200, geoJSON);
  }

  // 8. Plain Language Summary Generator API (PRD 6.2 POST /api/summary)
  if (pathname === '/api/summary' && req.method === 'POST') {
    const body = await parseBody(req);
    const slug = body.slug;
    const lang = body.lang || 'en';

    const mp = mps.find((m) => m.slug === slug);
    if (!mp) {
      return sendJSON(res, 404, { error: 'MP record not found' });
    }

    const isMinister = mp.is_minister;
    let text = '';
    if (lang === 'en') {
      if (isMinister) {
        text = `${mp.name} represents the ${mp.constituency} constituency in the 18th Lok Sabha and serves as a Union Minister. Because ministers represent the Government and do not sign the attendance register, ask parliamentary questions, or present private member bills, these indicators are not applicable. His record reflects his executive responsibilities in governance.`;
      } else {
        const att = mp.performance.attendance_pct ? `${mp.performance.attendance_pct}%` : 'Not available';
        const deb = mp.performance.debates ?? 0;
        const q = mp.performance.questions ?? 0;
        text = `${mp.name} represents ${mp.constituency} in the 18th Lok Sabha. Their parliamentary attendance is recorded at ${att}, having participated in ${deb} debates and raised ${q} questions to date.`;
      }
    } else {
      text = `${mp.name} ji 18th Lok Sabha mein ${mp.constituency} kshetra ke Sansad hain. Unki attendance ${mp.performance.attendance_pct || 90}% rahi hai aur unhone sansad mein ${mp.performance.debates || 0} debates aur ${mp.performance.questions || 0} sawal uthaye hain.`;
    }

    return sendJSON(res, 200, {
      slug,
      text,
      source: 'template',
      lang,
      dataAsOf: mp.performance.as_of,
      generatedAt: new Date().toISOString(),
    });
  }

  // 9. Citizen Action Draft API (PRD 6.2 POST /api/draft)
  if (pathname === '/api/draft' && req.method === 'POST') {
    const body = await parseBody(req);
    const slug = body.slug;
    const intent = body.intent || 'mplads_works';
    const lang = body.lang || 'en';
    const citizenName = body.citizenName || '[Your Name]';
    const locality = body.locality || '[Your Area/Locality]';

    const mp = mps.find((m) => m.slug === slug);
    if (!mp) {
      return sendJSON(res, 404, { error: 'MP record not found' });
    }

    const subject = `Representation regarding ${intent === 'mplads_works' ? 'Local Development' : 'Constituency Matters'} in ${mp.constituency}`;
    const text = `Respected ${mp.name} ji,\n\nI am writing to you as a resident of ${locality} in ${mp.constituency}.\n\nAs a voter, I would like to bring to your kind attention local development matters requiring priority in our parliamentary constituency.\n\nWarm regards,\n${citizenName}\n${locality}, ${mp.constituency}`;

    return sendJSON(res, 200, {
      subject,
      body: text,
      source: 'template',
      lang,
    });
  }

  // 404 fallback
  return sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Mera MP Backend API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔎 Search suggestions: http://localhost:${PORT}/api/search?q=delhi`);
  console.log(`======================================================\n`);
});

