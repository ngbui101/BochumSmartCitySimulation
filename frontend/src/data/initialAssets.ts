import type { ExistingAsset } from '../types/assets';

export const initialAssets: ExistingAsset[] = [
  {
    id: 'placeholder-solar-mitte',
    name: 'MVP-Spielplatzhalter Solarhub Mitte',
    assetTypeLabel: 'Solaranlage',
    zoneId: 'mitte',
    position: { lat: 51.481, lng: 7.216 },
    statusLabel: 'Bestand',
    roleDescription: 'Spielplatzhalter für eine bestehende lokale Energieanlage; keine reale Tatsachenbehauptung.',
    modifiable: false,
    dataConfidence: 'mvp-placeholder'
  },
  {
    id: 'placeholder-storage-wattenscheid',
    name: 'MVP-Spielplatzhalter Speicher Wattenscheid',
    assetTypeLabel: 'Energiespeicher',
    zoneId: 'wattenscheid',
    position: { lat: 51.481, lng: 7.145 },
    statusLabel: 'Bestand',
    roleDescription: 'Spielplatzhalter für eine bestehende Speicherrolle; keine reale Tatsachenbehauptung.',
    modifiable: false,
    dataConfidence: 'mvp-placeholder'
  },
  {
    id: 'placeholder-wind-nord',
    name: 'MVP-Spielplatzhalter Kleinwindanlage Nord',
    assetTypeLabel: 'Kleinwindanlage',
    zoneId: 'nord',
    position: { lat: 51.517, lng: 7.255 },
    statusLabel: 'Bestand',
    roleDescription: 'Spielplatzhalter für eine bestehende Kleinwindenergie-Rolle; keine reale Tatsachenbehauptung.',
    modifiable: false,
    dataConfidence: 'mvp-placeholder'
  }
];
