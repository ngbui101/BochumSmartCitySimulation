import type { ZoneRule } from '../types/zones';

export const zoneRules: ZoneRule[] = [
  {
    zoneId: 'innenstadt',
    label: 'Innenstadt',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 10, wind: 0, storage: 4 },
    acceptanceSensitivity: 'high',
    demandProfile: 'commercial_core'
  },
  {
    zoneId: 'wattenscheid',
    label: 'Wattenscheid',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 8, wind: 2, storage: 3 },
    acceptanceSensitivity: 'medium',
    demandProfile: 'mixed'
  },
  {
    zoneId: 'querenburg',
    label: 'Querenburg',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 7, wind: 0, storage: 3 },
    acceptanceSensitivity: 'medium',
    demandProfile: 'campus'
  },
  {
    zoneId: 'langendreer',
    label: 'Langendreer',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 8, wind: 1, storage: 3 },
    acceptanceSensitivity: 'medium',
    demandProfile: 'mixed'
  },
  {
    zoneId: 'gerthe_harpen',
    label: 'Gerthe / Harpen',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 9, wind: 2, storage: 3 },
    acceptanceSensitivity: 'low',
    demandProfile: 'suburban'
  },
  {
    zoneId: 'weitmar_linden',
    label: 'Weitmar / Linden',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 7, wind: 0, storage: 4 },
    acceptanceSensitivity: 'high',
    demandProfile: 'residential'
  },
  {
    zoneId: 'stiepel',
    label: 'Stiepel',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 6, wind: 1, storage: 2 },
    acceptanceSensitivity: 'high',
    demandProfile: 'suburban'
  }
];
