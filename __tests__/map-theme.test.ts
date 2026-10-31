// Mock Leaflet before importing component modules that reference it in a Node test environment
jest.mock('leaflet', () => ({
  map: jest.fn(),
  tileLayer: jest.fn(),
  geoJSON: jest.fn(),
  marker: jest.fn(),
  divIcon: jest.fn(),
  control: { scale: jest.fn().mockReturnValue({ addTo: jest.fn() }) },
}));

import { PARLIAMENTARY_THEMES, PARLIAMENTARY_THEMES_DARK, PARLIAMENTARY_THEMES_LIGHT } from '@/components/map/NagrikStyleMap';
import { REGIONS, REGIONS_DARK, REGIONS_LIGHT } from '@/components/map/IndiaAtlasMap';

describe('Map Thematic Palettes (Light & Dark Theme Invariants)', () => {
  const delhiSeats = [
    'north-west-delhi-delhi',
    'west-delhi-delhi',
    'chandni-chowk-delhi',
    'new-delhi-delhi',
    'south-delhi-delhi',
    'east-delhi-delhi',
    'north-east-delhi-delhi',
  ];

  const regions = ['delhi', 'north', 'central', 'west', 'east', 'south', 'northeast'];

  describe('Delhi Ward Map Themes (NagrikStyleMap)', () => {
    test('all 7 Delhi parliamentary constituencies are mapped in both themes', () => {
      delhiSeats.forEach((slug) => {
        expect(PARLIAMENTARY_THEMES_DARK[slug]).toBeDefined();
        expect(PARLIAMENTARY_THEMES_LIGHT[slug]).toBeDefined();
      });
    });

    test('backward-compatible PARLIAMENTARY_THEMES points to dark theme', () => {
      expect(PARLIAMENTARY_THEMES).toBe(PARLIAMENTARY_THEMES_DARK);
    });

    test('light theme provides distinct light pastel/vivid fills with dark strokes', () => {
      delhiSeats.forEach((slug) => {
        const light = PARLIAMENTARY_THEMES_LIGHT[slug];
        const dark = PARLIAMENTARY_THEMES_DARK[slug];
        expect(light.fill).not.toBe(dark.fill);
        expect(light.stroke).not.toBe(dark.stroke);
        expect(light.fill).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(light.stroke).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('India Atlas Vector Map Themes (IndiaAtlasMap)', () => {
    test('all 7 regions are configured in both dark and light palettes', () => {
      regions.forEach((id) => {
        expect(REGIONS_DARK[id]).toBeDefined();
        expect(REGIONS_LIGHT[id]).toBeDefined();
        expect(REGIONS_LIGHT[id].totalSeats).toBe(REGIONS_DARK[id].totalSeats);
      });
    });

    test('backward-compatible REGIONS points to dark theme config', () => {
      expect(REGIONS).toBe(REGIONS_DARK);
    });

    test('light theme badges use white backgrounds for high readability', () => {
      regions.forEach((id) => {
        expect(REGIONS_LIGHT[id].badgeBg).toBe('#ffffff');
      });
    });

    test('delhi live pilot region has 7 seats in both themes', () => {
      expect(REGIONS_DARK.delhi.totalSeats).toBe(7);
      expect(REGIONS_LIGHT.delhi.totalSeats).toBe(7);
    });
  });
});
