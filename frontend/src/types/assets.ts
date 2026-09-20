import type { ZoneId } from './zones';

export type ItemType = 'solar' | 'wind' | 'storage';

export type AssetStatus = 'under_construction' | 'active';

export type LatLngPosition = {
  lat: number;
  lng: number;
};

export type BalancingSource = 'mvp-playtest-value';

export type ItemDefinition = {
  itemType: ItemType;
  label: string;
  description: string;
  standardSizeLabel: string;
  cost: number;
  buildTimeMonths: 1;
  productionValue: number;
  storageValue: number;
  operatingCost: number;
  citizenSatisfactionImpact: number;
  balancingSource: BalancingSource;
};

export type PlayerAsset = {
  id: string;
  itemType: ItemType;
  zoneId: ZoneId;
  position: LatLngPosition;
  status: AssetStatus;
  placedMonthIndex: number;
  activeFromMonthIndex: number;
  purchasePrice: number;
};

export type PrivateAsset = {
  id: string;
  name: string;
  itemType: Extract<ItemType, 'solar' | 'storage'>;
  assetTypeLabel: string;
  zoneId: ZoneId;
  position: LatLngPosition;
  statusLabel: string;
  roleDescription: string;
  modifiable: false;
  sellable: false;
  operatingCost: 0;
  gridReliefCapacity: number;
  ownership: 'private';
  dataConfidence: 'mvp-placeholder';
};

export type ExistingAsset = {
  id: string;
  name: string;
  assetTypeLabel: string;
  zoneId: ZoneId;
  position: LatLngPosition;
  statusLabel: string;
  roleDescription: string;
  modifiable: false;
  dataConfidence: 'mvp-placeholder' | 'verified-real-data';
};
