import { itemDefinitions } from '../data/itemDefinitions';
import { subsidyPrograms } from '../data/subsidyPrograms';
import { zoneRules } from '../data/zoneRules';
import { getEnergyDemandForMonth } from '../data/energyDemand';
import type { PlayerAsset } from '../types/assets';
import type { GameKpis, GameState } from '../types/game';
import { calculateFinalScore } from './scoring';
import { createForecast, getWeatherProfileForMonth } from './weatherSimulation';

/** Importkosten pro fehlender Energieeinheit in Euro. */
const IMPORT_COST_PER_UNIT = 60_000;
const PRIVATE_STORAGE_DISCHARGE_RATE = 0.25;

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

function calculateAssetProduction(asset: PlayerAsset, monthIndex: number): number {
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

function calculateTotalProduction(activeAssets: PlayerAsset[], monthIndex: number): number {
  return activeAssets.reduce((sum, asset) => sum + calculateAssetProduction(asset, monthIndex), 0);
}

function calculateStorageCapacity(activeAssets: PlayerAsset[]): number {
  return activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.storageValue ?? 0);
  }, 0);
}

function calculateSubsidyCosts(state: GameState): number {
  const subsidies = state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };

  return (
    subsidies.solar.level * subsidyPrograms.solar.monthlyCostPerLevel +
    subsidies.storage.level * subsidyPrograms.storage.monthlyCostPerLevel
  );
}

function calculateNextSubsidies(state: GameState): NonNullable<GameState['subsidies']> {
  const subsidies = state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };

  return {
    solar: {
      ...subsidies.solar,
      privateCapacity:
        subsidies.solar.privateCapacity +
        subsidies.solar.level * subsidyPrograms.solar.adoptionPerLevel
    },
    storage: {
      ...subsidies.storage,
      privateCapacity:
        subsidies.storage.privateCapacity +
        subsidies.storage.level * subsidyPrograms.storage.adoptionPerLevel
    }
  };
}

/**
 * Berechnet die Energiebilanz für einen Monat.
 *
 * - Defizit (Saldo < 0): Importkosten werden berechnet, gespeicherte Energie wird aufgebraucht.
 * - Überschuss (Saldo > 0): Überschuss füllt den persistenten Speicher-Puffer bis zur Kapazität.
 *   Nicht gespeicherter Überschuss wird verschwendet.
 */
function calculateEnergyBalance(
  state: GameState,
  activeAssets: PlayerAsset[],
  monthIndex: number,
  subsidies: NonNullable<GameState['subsidies']>
): {
  production: number;
  demand: number;
  saldo: number;
  importCost: number;
  newStoredEnergy: number;
  privateSolarProduction: number;
  privateStorageDischarge: number;
} {
  const production = calculateTotalProduction(activeAssets, monthIndex);
  const demand = getEnergyDemandForMonth(monthIndex);
  const storageCapacity = calculateStorageCapacity(activeAssets);
  const weatherProfile = getWeatherProfileForMonth(monthIndex);
  const privateSolarProduction = Math.round(subsidies.solar.privateCapacity * weatherProfile.solarFactor * 10) / 10;
  const availableEnergy = production + state.storedEnergy;
  const rawSaldo = availableEnergy + privateSolarProduction - demand;
  const privateStorageDischarge =
    rawSaldo < 0
      ? Math.min(Math.abs(rawSaldo), subsidies.storage.privateCapacity * PRIVATE_STORAGE_DISCHARGE_RATE)
      : 0;
  const saldo = rawSaldo + privateStorageDischarge;

  if (saldo < 0) {
    // Defizit: alle gespeicherte Energie ist verbraucht, Rest muss importiert werden
    return {
      production,
      demand,
      saldo,
      importCost: Math.abs(saldo) * IMPORT_COST_PER_UNIT,
      newStoredEnergy: 0,
      privateSolarProduction,
      privateStorageDischarge
    };
  }

  // Überschuss: Speicher so weit füllen wie möglich, Rest wird verschwendet
  return {
    production,
    demand,
    saldo,
    importCost: 0,
    newStoredEnergy: Math.min(saldo, storageCapacity),
    privateSolarProduction,
    privateStorageDischarge
  };
}

function calculateNextKpis(
  state: GameState,
  activeAssets: PlayerAsset[],
  subsidies: NonNullable<GameState['subsidies']>
): GameKpis {
  const production = calculateTotalProduction(activeAssets, state.currentMonthIndex);
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
  const currentSubsidies = state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };
  const subsidyCitizenBonus = currentSubsidies.solar.level * 0.4 + currentSubsidies.storage.level * 0.25;
  const privateSecurityBonus = Math.min(4, subsidies.storage.privateCapacity * 0.08);

  return {
    energyAutarky: clampScore(state.kpis.energyAutarky + production * 0.35),
    citizenSatisfaction: clampScore(state.kpis.citizenSatisfaction + citizenImpact + subsidyCitizenBonus),
    supplySecurity: clampScore(
      state.kpis.supplySecurity + storageValue * 0.5 + mixedGenerationBonus + privateSecurityBonus
    )
  };
}

function calculateNextBudget(
  state: GameState,
  netMonthlyDelta: number
): number {
  return Math.max(0, Math.round(state.budget + netMonthlyDelta));
}

export function advanceMonth(state: GameState): GameState {
  if (state.status === 'finished') {
    return state;
  }

  const nextMonthIndex = state.currentMonthIndex + 1;
  const playerAssets = activateCompletedAssets(state, nextMonthIndex);
  const activeAssets = playerAssets.filter((asset) => asset.status === 'active');
  const status = nextMonthIndex >= 60 ? 'finished' : state.status;
  const subsidies = calculateNextSubsidies(state);

  const energyBalance = calculateEnergyBalance(state, activeAssets, state.currentMonthIndex, subsidies);

  const revenueFromSales = energyBalance.demand * 40_000;
  const subsidyCosts = calculateSubsidyCosts(state);
  const operatingCosts = activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.operatingCost ?? 0);
  }, 0);
  const netMonthlyDelta = revenueFromSales - energyBalance.importCost - operatingCosts - subsidyCosts;

  const nextState: GameState = {
    ...state,
    currentMonthIndex: nextMonthIndex,
    budget: calculateNextBudget(state, netMonthlyDelta),
    kpis: calculateNextKpis(state, activeAssets, subsidies),
    playerAssets,
    subsidies,
    storedEnergy: energyBalance.newStoredEnergy,
    undoStack: [],
    monthlyHistory: [
      ...state.monthlyHistory,
      {
        monthIndex: state.currentMonthIndex,
        budget: state.budget,
        kpis: state.kpis,
        energyDemand: energyBalance.demand,
        energyProduction: energyBalance.production,
        energySaldo: energyBalance.saldo,
        importCost: energyBalance.importCost,
        storedEnergy: state.storedEnergy,
        revenueFromSales,
        operatingCosts,
        subsidyCosts,
        privateSolarProduction: energyBalance.privateSolarProduction,
        privateStorageDischarge: energyBalance.privateStorageDischarge,
        netMonthlyDelta
      }
    ],
    forecast: createForecast(nextMonthIndex),
    status
  };

  return status === 'finished'
    ? {
        ...nextState,
        finalScore: calculateFinalScore(nextState)
      }
    : nextState;
}
