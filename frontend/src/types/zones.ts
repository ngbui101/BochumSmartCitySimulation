import type { ItemType } from './assets';

export type ZoneId =
  | 'mitte'
  | 'wattenscheid'
  | 'nord'
  | 'ost'
  | 'sued'
  | 'suedwest';

export type ZoneCapacity = Record<ItemType, number>;

export type ZoneDemandProfile = 'commercial_core' | 'mixed' | 'campus' | 'residential' | 'suburban';

export type AcceptanceSensitivity = 'low' | 'medium' | 'high';

export type ZoneRule = {
  zoneId: ZoneId;
  label: string;
  allowedItemTypes: ItemType[];
  capacity: ZoneCapacity;
  acceptanceSensitivity: AcceptanceSensitivity;
  demandProfile: ZoneDemandProfile;
};

export type PlacementRuleResult = {
  allowed: boolean;
  reason: string;
  remaining: number;
  capacity: number;
};
