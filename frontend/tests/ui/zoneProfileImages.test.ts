import { describe, expect, it } from 'vitest';
import { getZoneProfileImage } from '../../src/ui/zoneProfileImages';

describe('zoneProfileImages', () => {
  it('returns public photo paths for zones with generated profile images', () => {
    expect(getZoneProfileImage('innenstadt')).toBe('/photos/Innenstadt.png');
    expect(getZoneProfileImage('wattenscheid')).toBe('/photos/Wattenscheid.png');
    expect(getZoneProfileImage('weitmar_linden')).toBe('/photos/Weitmar.png');
  });

  it('returns null for zones without a generated profile image', () => {
    expect(getZoneProfileImage('stiepel')).toBeNull();
  });
});
