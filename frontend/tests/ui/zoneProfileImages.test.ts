import { describe, expect, it } from 'vitest';
import { getZoneProfileImage } from '../../src/ui/zoneProfileImages';

describe('zoneProfileImages', () => {
  it('returns public photo paths for zones with generated profile images', () => {
    expect(getZoneProfileImage('mitte')).toBe('/photos/Innenstadt.png');
    expect(getZoneProfileImage('wattenscheid')).toBe('/photos/Wattenscheid.png');
    expect(getZoneProfileImage('ost')).toBe('/photos/Langendreer.png');
    expect(getZoneProfileImage('sued')).toBe('/photos/Querenburg.png');
    expect(getZoneProfileImage('suedwest')).toBe('/photos/Weitmar.png');
  });
});
