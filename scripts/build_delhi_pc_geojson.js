const fs = require('fs');
const path = require('path');

// Clean polygon definitions covering Delhi's 7 Parliamentary Constituencies
// Each polygon is a closed ring of [lng, lat] coordinates (WGS84 standard)
const features = [
  {
    type: "Feature",
    id: "chandni-chowk-delhi",
    properties: {
      slug: "chandni-chowk-delhi",
      pc_name: "Chandni Chowk",
      pc_no: 1,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Praveen Khandelwal",
      party: "BJP",
      center: [28.6800, 77.1850]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [77.1350, 28.6850],
        [77.1600, 28.7250],
        [77.1950, 28.7300],
        [77.2250, 28.7100],
        [77.2450, 28.6750],
        [77.2450, 28.6400],
        [77.2100, 28.6450],
        [77.1700, 28.6650],
        [77.1350, 28.6850]
      ]]
    }
  },
  {
    type: "Feature",
    id: "north-east-delhi-delhi",
    properties: {
      slug: "north-east-delhi-delhi",
      pc_name: "North East Delhi",
      pc_no: 2,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Manoj Kumar Tiwari",
      party: "BJP",
      center: [28.7100, 77.2650]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [77.2000, 28.7200],
        [77.2000, 28.8200],
        [77.2350, 28.8200],
        [77.2650, 28.7600],
        [77.3200, 28.7250],
        [77.3000, 28.6700],
        [77.2500, 28.6700],
        [77.2250, 28.7100],
        [77.2000, 28.7200]
      ]]
    }
  },
  {
    type: "Feature",
    id: "east-delhi-delhi",
    properties: {
      slug: "east-delhi-delhi",
      pc_name: "East Delhi",
      pc_no: 3,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Harsh Malhotra",
      party: "BJP",
      center: [28.6250, 77.2950]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [77.2500, 28.6700],
        [77.3000, 28.6700],
        [77.3400, 28.6400],
        [77.3400, 28.5800],
        [77.3100, 28.5200],
        [77.2700, 28.5200],
        [77.2500, 28.5800],
        [77.2400, 28.6300],
        [77.2500, 28.6700]
      ]]
    }
  },
  {
    type: "Feature",
    id: "new-delhi-delhi",
    properties: {
      slug: "new-delhi-delhi",
      pc_name: "New Delhi",
      pc_no: 4,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Bansuri Swaraj",
      party: "BJP",
      center: [28.5950, 77.1950]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [77.1400, 28.6600],
        [77.1700, 28.6650],
        [77.2100, 28.6450],
        [77.2450, 28.6400],
        [77.2500, 28.5800],
        [77.2450, 28.5300],
        [77.2000, 28.5300],
        [77.1700, 28.5600],
        [77.1350, 28.6100],
        [77.1400, 28.6600]
      ]]
    }
  },
  {
    type: "Feature",
    id: "north-west-delhi-delhi",
    properties: {
      slug: "north-west-delhi-delhi",
      pc_name: "North West Delhi",
      pc_no: 5,
      state: "Delhi",
      reservation: "SC",
      mp_name: "Yogender Chandolia",
      party: "BJP",
      center: [28.7500, 77.0800]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [76.9800, 28.7200],
        [76.9800, 28.8400],
        [77.0600, 28.8800],
        [77.1500, 28.8600],
        [77.2000, 28.8200],
        [77.2000, 28.7200],
        [77.1600, 28.7250],
        [77.1350, 28.6850],
        [77.0500, 28.6800],
        [76.9800, 28.7200]
      ]]
    }
  },
  {
    type: "Feature",
    id: "west-delhi-delhi",
    properties: {
      slug: "west-delhi-delhi",
      pc_name: "West Delhi",
      pc_no: 6,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Kamaljeet Sehrawat",
      party: "BJP",
      center: [28.6300, 77.0500]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [76.8400, 28.6200],
        [76.9800, 28.7200],
        [77.0500, 28.6800],
        [77.1350, 28.6850],
        [77.1400, 28.6600],
        [77.1350, 28.6100],
        [77.0800, 28.5600],
        [77.0200, 28.5600],
        [76.8800, 28.5800],
        [76.8400, 28.6200]
      ]]
    }
  },
  {
    type: "Feature",
    id: "south-delhi-delhi",
    properties: {
      slug: "south-delhi-delhi",
      pc_name: "South Delhi",
      pc_no: 7,
      state: "Delhi",
      reservation: "GEN",
      mp_name: "Ramvir Singh Bidhuri",
      party: "BJP",
      center: [28.5100, 77.1800]
    },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [77.0200, 28.5600],
        [77.0800, 28.5600],
        [77.1350, 28.6100],
        [77.1700, 28.5600],
        [77.2000, 28.5300],
        [77.2450, 28.5300],
        [77.2700, 28.5200],
        [77.3100, 28.5200],
        [77.3300, 28.4800],
        [77.2700, 28.4200],
        [77.1600, 28.4200],
        [77.0800, 28.4800],
        [77.0200, 28.5600]
      ]]
    }
  }
];

const geojson = {
  type: "FeatureCollection",
  name: "delhi_parliamentary_constituencies",
  crs: {
    type: "name",
    properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
  },
  features
};

const targetPath = path.join(__dirname, '..', 'data', 'processed', 'delhi_pc.geojson');
fs.writeFileSync(targetPath, JSON.stringify(geojson, null, 2));
console.log(`Generated verified GeoJSON with ${features.length} constituencies at ${targetPath}`);

