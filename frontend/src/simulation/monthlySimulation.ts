import { itemDefinitions } from '../data/itemDefinitions';
import { zoneRules } from '../data/zoneRules';
import type { PlayerAsset } from '../types/assets';
import type { GameKpis, GameState } from '../types/game';
import { createForecast, getWeatherProfileForMonth } from './weatherSimulation';

const SAVINGS_PER_PRODUCTION_VALUE = 50_000;

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

function activateCompletedAssets(state: GameState, nextMonthIndex: number): PlayerAsset[] {
  return state.playerAssets.map((asset) => {
    if (asset.status === 'under_construction' && asset.activeFromMonthIndex <= nextMonthIndex) {
      return {
        ...asset,
        status: 'active'
      };
    }

    return asset;
  });
}

function calculateProduction(asset: PlayerAsset, monthIndex: number): number {
  const itemDefinition = getItemDefinition(asset.itemType);
  const weatherProfile = getWeatherProfileForMonth(monthIndex);

  if (!itemDefinition) {
    return 0;
  }

  if (asset.itemType === 'solar') {
    return itemDefinition.productionValue * weatherProfile.solarFactor;
  }

  if (asset.itemType === 'wind') {
    return itemDefinition.productionValue * weatherProfile.windFactor;
  }

  return 0;
}

function calculateNextKpis(state: GameState, activeAssets: PlayerAsset[]): GameKpis {
  const production = activeAssets.reduce(
    (sum, asset) => sum + calculateProduction(asset, state.currentMonthIndex),
    0
  );
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

  return {
    energyAutarky: clampScore(state.kpis.energyAutarky + production * 0.35),
    citizenSatisfaction: clampScore(state.kpis.citizenSatisfaction + citizenImpact),
    supplySecurity: clampScore(state.kpis.supplySecurity + storageValue * 0.5 + mixedGenerationBonus)
  };
}

function calculateNextBudget(state: GameState, activeAssets: PlayerAsset[]): number {
  const productionSavings = activeAssets.reduce(
    (sum, asset) => sum + calculateProduction(asset, state.currentMonthIndex) * SAVINGS_PER_PRODUCTION_VALUE,
    0
  );
  const operatingCosts = activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.operatingCost ?? 0);
  }, 0);

  return Math.max(0, Math.round(state.budget + productionSavings - operatingCosts));
}

export function advanceMonth(state: GameState): GameState {
  if (state.status === 'finished') {
    return state;
  }

  const nextMonthIndex = state.currentMonthIndex + 1;
  const playerAssets = activateCompletedAssets(state, nextMonthIndex);
  const activeAssets = playerAssets.filter((asset) => asset.status === 'active');

  return {
    ...state,
    currentMonthIndex: nextMonthIndex,
    budget: calculateNextBudget(state, activeAssets),
    kpis: calculateNextKpis(state, activeAssets),
    playerAssets,
    undoStack: [],
    monthlyHistory: [
      ...state.monthlyHistory,
      {
        monthIndex: state.currentMonthIndex,
        budget: state.budget,
        kpis: state.kpis
      }
    ],
    forecast: createForecast(nextMonthIndex),
    status: nextMonthIndex >= 60 ? 'finished' : state.status
  };
}
