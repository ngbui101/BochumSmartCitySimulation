import { itemDefinitions } from '../data/itemDefinitions';
import { zoneRules } from '../data/zoneRules';
import type { PlayerAsset } from '../types/assets';
import type { GameKpis, GameState } from '../types/game';
import { getSubsidies } from './monthlyBalance';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getItemDefinition(itemType: PlayerAsset['itemType']) {
  return itemDefinitions.find((item) => item.itemType === itemType);
}

function getSensitivityMultiplier(zoneId: PlayerAsset['zoneId']): number {
  const sensitivity = zoneRules.find((zoneRule) => zoneRule.zoneId === zoneId)?.acceptanceSensitivity;

  if (sensitivity === 'high') {
    return 1.5;
  }

  if (sensitivity === 'medium') {
    return 1;
  }

  return 0.5;
}

export function calculateNextKpis(
  state: GameState,
  activeAssets: PlayerAsset[],
  subsidies: NonNullable<GameState['subsidies']>,
  energyBalance: {
    demand: number;
    saldo: number;
  }
): GameKpis {
  const storageValue = activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.storageValue ?? 0);
  }, 0);
  const citizenImpact = activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    const baseImpact = itemDefinition?.citizenSatisfactionImpact ?? 0;
    return sum + baseImpact * getSensitivityMultiplier(asset.zoneId);
  }, 0);
  const hasSolar = activeAssets.some((asset) => asset.itemType === 'solar');
  const hasWind = activeAssets.some((asset) => asset.itemType === 'wind');
  const mixedGenerationBonus = hasSolar && hasWind ? 2 : 0;
  const currentSubsidies = getSubsidies(state);
  const subsidyCitizenBonus = currentSubsidies.solar.level * 0.4 + currentSubsidies.storage.level * 0.25;
  const privateSecurityBonus = Math.min(4, subsidies.storage.privateCapacity * 0.08);
  const importedEnergy = Math.max(0, -energyBalance.saldo);
  const coveredDemand = Math.max(0, energyBalance.demand - importedEnergy);
  const monthlyEnergyAutarky = energyBalance.demand > 0
    ? (coveredDemand / energyBalance.demand) * 100
    : 0;
  const currentSupplySecurity = storageValue * 0.5 + mixedGenerationBonus + privateSecurityBonus;

  return {
    energyAutarky: clampScore(monthlyEnergyAutarky),
    citizenSatisfaction: clampScore(state.kpis.citizenSatisfaction + citizenImpact + subsidyCitizenBonus),
    supplySecurity: clampScore(currentSupplySecurity)
  };
}
