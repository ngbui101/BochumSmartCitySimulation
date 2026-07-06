import { describe, expect, it } from 'vitest';

import { findZoneForPoint } from '../../src/simulation/zoneDetection';

const zonesGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zoneId: 'mitte' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[7.185, 51.492], [7.235, 51.492], [7.238, 51.465], [7.188, 51.462], [7.185, 51.492]]]
      }
    },
    {
      type: 'Feature',
      properties: { zoneId: 'wattenscheid' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[7.105, 51.505], [7.18, 51.5], [7.18, 51.462], [7.105, 51.458], [7.105, 51.505]]]
      }
    },
    {
      type: 'Feature',
      properties: { zoneId: 'nord' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[7.22, 51.54], [7.305, 51.538], [7.31, 51.495], [7.235, 51.492], [7.22, 51.54]]]
      }
    }
  ]
} as const;

describe('findZoneForPoint', () => {
  it('returns the zone id for a point inside an MVP game zone', () => {
    expect(findZoneForPoint({ lat: 51.48, lng: 7.21 }, zonesGeoJson)).toBe('mitte');
    expect(findZoneForPoint({ lat: 51.48, lng: 7.14 }, zonesGeoJson)).toBe('wattenscheid');
  });

  it('returns null for a point outside all MVP game zones', () => {
    expect(findZoneForPoint({ lat: 51.56, lng: 7.08 }, zonesGeoJson)).toBeNull();
  });

  it('uses the same pure detection for hover and drop coordinates', () => {
    const hoverZone = findZoneForPoint({ lat: 51.515, lng: 7.26 }, zonesGeoJson);
    const dropZone = findZoneForPoint({ lat: 51.515, lng: 7.26 }, zonesGeoJson);

    expect(hoverZone).toBe('nord');
    expect(dropZone).toBe(hoverZone);
  });
});
