import { describe, expect, it } from 'vitest';
import { getAssetIconAlt, getAssetIconSrc } from '../../src/ui/gameAssetIcons';

describe('game asset icon configuration', () => {
  it('returns centralized icon paths for default, build, and selected states', () => {
    expect(getAssetIconSrc('solar')).toBe('/icons/Solaranlage.png');
    expect(getAssetIconSrc('wind', 'under_construction')).toBe(
      '/icons/Windkraftanlage_build.png'
    );
    expect(getAssetIconSrc('storage', 'active', true)).toBe(
      '/icons/Energiespeicher_selected.png'
    );
  });

  it('returns accessible alt text for default, build, and selected states', () => {
    expect(getAssetIconAlt('solar')).toBe('Solaranlage');
    expect(getAssetIconAlt('wind', 'under_construction')).toBe('Windkraftanlage im Bau');
    expect(getAssetIconAlt('storage', 'active', true)).toBe(
      'Ausgewählter Energiespeicher'
    );
  });
});
