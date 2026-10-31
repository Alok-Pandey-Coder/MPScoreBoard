const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Delhi/Delhi_Wards.geojson';
const targetPath = path.join(__dirname, '..', 'data', 'processed', 'delhi_wards_enriched.geojson');
const pcGeoPath = path.join(__dirname, '..', 'data', 'processed', 'delhi_pc.json');

const pcGeo = JSON.parse(fs.readFileSync(pcGeoPath, 'utf8'));

// Point in polygon helper
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

function getCenterOfPolygon(coordinates) {
  let totalX = 0, totalY = 0, count = 0;
  const ring = Array.isArray(coordinates[0][0]) ? coordinates[0] : coordinates;
  for (const pt of ring) {
    totalX += pt[0];
    totalY += pt[1];
    count++;
  }
  return [totalX / count, totalY / count]; // [lng, lat]
}

console.log('Downloading Delhi_Wards.geojson...');
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf-8');
    const wardsGeo = JSON.parse(raw);
    console.log(`Downloaded ${wardsGeo.features.length} wards. Enriching with PC mapping...`);

    const enrichedFeatures = wardsGeo.features.map(f => {
      const geom = f.geometry;
      let center = [77.209, 28.6139];
      if (geom.type === 'Polygon') {
        center = getCenterOfPolygon(geom.coordinates[0]);
      } else if (geom.type === 'MultiPolygon') {
        center = getCenterOfPolygon(geom.coordinates[0][0]);
      }

      // Find matching PC via point-in-polygon
      let matchedSlug = 'chandni-chowk-delhi';
      let matchedPCName = 'Chandni Chowk';

      for (const pc of pcGeo.features) {
        if (pc.geometry.type === 'Polygon') {
          if (isPointInRing(center, pc.geometry.coordinates[0])) {
            matchedSlug = pc.properties.slug;
            matchedPCName = pc.properties.pc_name;
            break;
          }
        }
      }

      // Clean ward number
      let rawNo = f.properties.Ward_No || '';
      let cleanNo = rawNo.replace(/^0+/, '');
      if (rawNo.startsWith('CANT_')) cleanNo = 'C' + rawNo.replace('CANT_', '');

      return {
        ...f,
        properties: {
          ...f.properties,
          ward_display: cleanNo,
          pc_slug: matchedSlug,
          pc_name: matchedPCName,
          center: [center[1], center[0]] // [lat, lng]
        }
      };
    });

    const output = {
      type: "FeatureCollection",
      name: "delhi_wards_enriched",
      features: enrichedFeatures
    };

    fs.writeFileSync(targetPath, JSON.stringify(output));
    console.log(`Saved ${enrichedFeatures.length} enriched wards to ${targetPath}`);
  });
}).on('error', err => console.error(err));

