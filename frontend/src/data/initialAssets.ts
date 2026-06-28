import type { ExistingAsset } from '../types/assets';

export const initialAssets: ExistingAsset[] = [
  {
    id: 'placeholder-solar-innenstadt',
    name: 'MVP-Spielplatzhalter Solarhub Innenstadt',
    assetTypeLabel: 'Solaranlage',
    zoneId: 'innenstadt',
    position: { lat: 51.481, lng: 7.216 },
    statusLabel: 'Bestand',
    roleDescription: 'Spielplatzhalter fuer eine bestehende lokale Energieanlage; keine reale Tatsachenbehauptung.',
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
    roleDescription: 'Spielplatzhalter fuer eine bestehende Speicherrolle; keine reale Tatsachenbehauptung.',
    modifiable: false,
    dataConfidence: 'mvp-placeholder'
  },
  {
    id: 'placeholder-wind-gerthe-harpen',
    name: 'MVP-Spielplatzhalter Windanlage Gerthe / Harpen',
    assetTypeLabel: 'Windmuehle',
    zoneId: 'gerthe_harpen',
    position: { lat: 51.517, lng: 7.255 },
    statusLabel: 'Bestand',
    roleDescription: 'Spielplatzhalter fuer eine bestehende Windenergie-Rolle; keine reale Tatsachenbehauptung.',
    modifiable: false,
    dataConfidence: 'mvp-placeholder'
  }
];
