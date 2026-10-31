const https = require('https');

https.get('https://raw.githubusercontent.com/shuklaneerajdev/IndiaStateTopojsonFiles/master/Delhi.geojson', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const geo = JSON.parse(data);
    console.log('Feature count:', geo.features.length);
    geo.features.forEach((f, idx) => {
      console.log(`[${idx}]`, f.properties);
    });
  });
});

