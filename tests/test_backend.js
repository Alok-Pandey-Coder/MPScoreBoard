const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('   MERA MP DELHI - BACKEND SPATIAL & API TEST SUITE     ');
console.log('========================================================\n');

// 1. Load Data
const mpsPath = path.join(__dirname, '..', 'data', 'processed', 'mps.json');
const geoPath = path.join(__dirname, '..', 'data', 'processed', 'delhi_pc.geojson');

const mps = JSON.parse(fs.readFileSync(mpsPath, 'utf8'));
const geojson = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

console.log(`[PASS] 1. Processed MPs Loaded: ${mps.length} (Expected: 7)`);
if (mps.length !== 7) throw new Error('Expected 7 MPs');

console.log(`[PASS] 2. Delhi PC GeoJSON Loaded: ${geojson.features.length} Polygons (Expected: 7)`);
if (geojson.features.length !== 7) throw new Error('Expected 7 Features');

// 2. Spatial Algorithms (Ray-Casting Point-in-Polygon)
function isPointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function resolvePoint(lat, lng) {
  const pt = [lng, lat];
  for (const f of geojson.features) {
    if (f.geometry.type === 'Polygon') {
      if (isPointInRing(pt, f.geometry.coordinates[0])) {
        return f;
      }
    }
  }
  return null;
}

// 3. Test Cases for GPS Coords -> Constituency resolution
const testPoints = [
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, expected: 'New Delhi' },
  { name: 'Chandni Chowk', lat: 28.6562, lng: 77.2307, expected: 'Chandni Chowk' },
  { name: 'Laxmi Nagar (East Delhi)', lat: 28.6310, lng: 77.2790, expected: 'East Delhi' },
  { name: 'Karawal Nagar (North East Delhi)', lat: 28.7250, lng: 77.2730, expected: 'North East Delhi' },
  { name: 'Rohini (North West Delhi)', lat: 28.7120, lng: 77.1210, expected: 'North West Delhi' },
  { name: 'Dwarka (West Delhi)', lat: 28.5823, lng: 77.0500, expected: 'West Delhi' },
  { name: 'Mehrauli (South Delhi)', lat: 28.5177, lng: 77.1852, expected: 'South Delhi' }
];

console.log('\n--- 3. Testing Point-in-Polygon GPS Resolution ---');
for (const tp of testPoints) {
  const match = resolvePoint(tp.lat, tp.lng);
  if (!match) {
    throw new Error(`Failed to resolve coordinates for ${tp.name} (${tp.lat}, ${tp.lng})`);
  }
  const matchedMP = mps.find(m => m.slug === match.properties.slug);
  console.log(`[PASS] Point (${tp.lat}, ${tp.lng}) [${tp.name}] => ${match.properties.pc_name} | MP: ${matchedMP?.name} (${matchedMP?.party})`);
  if (match.properties.pc_name !== tp.expected) {
    throw new Error(`Expected ${tp.expected} but got ${match.properties.pc_name}`);
  }
}

// 4. Test Neutrality & Data Integrity Invariants
console.log('\n--- 4. Checking Neutrality & Invariant Rules ---');
mps.forEach(m => {
  // Rule: Minister performance fields must be null, never 0
  if (m.is_minister) {
    if (m.performance.attendance_pct !== null) {
      throw new Error(`Minister ${m.name} has non-null attendance_pct`);
    }
    console.log(`[PASS] Verified Minister Rule: ${m.name} has attendance_pct = null (not 0)`);
  } else {
    // Normal MP should have attendance percentage
    if (typeof m.performance.attendance_pct !== 'number') {
      throw new Error(`MP ${m.name} should have numerical attendance`);
    }
  }

  // Rule: Every MP must have a verified source URL and retrieve date
  if (!m.profile.source?.url || !m.profile.source?.retrieved_at) {
    throw new Error(`MP ${m.name} missing profile source citation`);
  }
});

console.log('\n========================================================');
console.log('   ALL BACKEND SPATIAL & INTEGRATION INVARIANTS PASSED!  ');
console.log('========================================================');

