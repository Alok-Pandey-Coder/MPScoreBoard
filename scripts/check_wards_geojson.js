const https = require('https');

const url = 'https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Delhi/Delhi_Wards.geojson';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf-8');
    console.log(`Status: ${res.statusCode}, Length: ${raw.length}`);
    try {
      const geo = JSON.parse(raw);
      console.log(`Features count: ${geo.features.length}`);
      console.log('Sample properties [0]:', geo.features[0].properties);
      console.log('Sample properties [1]:', geo.features[1].properties);
      console.log('Sample properties [20]:', geo.features[20]?.properties);
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  });
}).on('error', err => console.error(err));

