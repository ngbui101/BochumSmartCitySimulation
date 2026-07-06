import { describe, expect, it } from 'vitest';
import { bochumBounds, minZoom, maxZoom } from '../../src/map/mapBounds';

describe('mapBounds configuration', () => {
  it('uses tight city bounds derived from the OpenStreetMap Bochum boundary with a small map margin', () => {
    expect(bochumBounds).toEqual([
      [51.391, 7.082],
      [51.551, 7.369]
    ]);
  });

  it('has correct minZoom and maxZoom values', () => {
    expect(minZoom).toBe(12);
    expect(maxZoom).toBe(16);
  });
});
