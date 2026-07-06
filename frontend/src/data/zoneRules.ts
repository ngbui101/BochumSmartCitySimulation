import type { ZoneRule } from '../types/zones';

export const zoneRules: ZoneRule[] = [
  {
    zoneId: 'mitte',
    label: 'Mitte',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 12, wind: 0, storage: 5 },
    acceptanceSensitivity: 'high',
    demandProfile: 'commercial_core'
  },
  {
    zoneId: 'wattenscheid',
    label: 'Wattenscheid',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 10, wind: 2, storage: 4 },
    acceptanceSensitivity: 'medium',
    demandProfile: 'mixed'
  },
  {
    zoneId: 'nord',
    label: 'Nord',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 9, wind: 2, storage: 3 },
    acceptanceSensitivity: 'low',
    demandProfile: 'suburban'
  },
  {
    zoneId: 'ost',
    label: 'Ost',
    allowedItemTypes: ['solar', 'wind', 'storage'],
    capacity: { solar: 10, wind: 2, storage: 4 },
    acceptanceSensitivity: 'medium',
    demandProfile: 'mixed'
  },
  {
    zoneId: 'sued',
    label: 'Süd',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 9, wind: 0, storage: 4 },
    acceptanceSensitivity: 'high',
    demandProfile: 'campus'
  },
  {
    zoneId: 'suedwest',
    label: 'Südwest',
    allowedItemTypes: ['solar', 'storage'],
    capacity: { solar: 9, wind: 0, storage: 4 },
    acceptanceSensitivity: 'high',
    demandProfile: 'residential'
  }
];
