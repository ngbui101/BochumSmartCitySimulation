import { itemDefinitions } from '../data/itemDefinitions';
import { zoneRules } from '../data/zoneRules';
import type { ItemType } from '../types/assets';
import type { GameState } from '../types/game';
import type { PlacementRuleResult, ZoneId } from '../types/zones';

function getZoneRule(zoneId: ZoneId) {
  return zoneRules.find((rule) => rule.zoneId === zoneId);
}

function getItemCost(itemType: ItemType): number {
  return itemDefinitions.find((item) => item.itemType === itemType)?.cost ?? 0;
}

export function getRemainingCapacity(state: GameState, itemType: ItemType, zoneId: ZoneId): number {
  const zoneRule = getZoneRule(zoneId);

  if (!zoneRule) {
    return 0;
  }

  const usedCapacity = state.playerAssets.filter(
    (asset) => asset.zoneId === zoneId && asset.itemType === itemType
  ).length;

  return Math.max(0, zoneRule.capacity[itemType] - usedCapacity);
}

export function canPlaceItem(
  state: GameState,
  itemType: ItemType,
  zoneId: ZoneId
): PlacementRuleResult {
  const zoneRule = getZoneRule(zoneId);

  if (!zoneRule) {
    return {
      allowed: false,
      reason: 'Zone ist nicht bekannt.',
      remaining: 0,
      capacity: 0
    };
  }

  const remaining = getRemainingCapacity(state, itemType, zoneId);
  const capacity = zoneRule.capacity[itemType];

  if (!zoneRule.allowedItemTypes.includes(itemType)) {
    return {
      allowed: false,
      reason: `${itemType} ist in ${zoneRule.label} nicht erlaubt.`,
      remaining,
      capacity
    };
  }

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Kapazität für ${itemType} in ${zoneRule.label} ist erschöpft.`,
      remaining,
      capacity
    };
  }

  const itemCost = getItemCost(itemType);

  if (state.budget < itemCost) {
    return {
      allowed: false,
      reason: `Budget reicht nicht für ${itemType}.`,
      remaining,
      capacity
    };
  }

  return {
    allowed: true,
    reason: 'Platzierung möglich.',
    remaining,
    capacity
  };
}
