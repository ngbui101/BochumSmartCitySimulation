import { describe, expect, it } from 'vitest';

import { getMapTileLayerConfig } from '../../src/map/mapTiles';

describe('map tile configuration', () => {
  it('uses the CARTO light basemap when an API key is provided', () => {
    const config = getMapTileLayerConfig('test-carto-key');

    expect(config.url).toBe(
      'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=test-carto-key'
    );
    expect(config.attribution).toContain('CARTO');
    expect(config.attribution).toContain('OpenStreetMap');
  });

  it('falls back to OpenStreetMap when no API key is available', () => {
    const config = getMapTileLayerConfig();

    expect(config.url).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(config.attribution).toContain('OpenStreetMap');
    expect(config.attribution).not.toContain('CARTO');
  });
});
