import { describe, expect, it } from 'vitest';
import { bochumBounds, minZoom, maxZoom } from '../../src/map/mapBounds';

describe('mapBounds configuration', () => {
  it('has correct bochumBounds coordinates', () => {
    expect(bochumBounds).toEqual([
      [51.35, 7.05],
      [51.58, 7.40]
    ]);
  });

  it('has correct minZoom and maxZoom values', () => {
    expect(minZoom).toBe(12);
    expect(maxZoom).toBe(16);
  });
});
