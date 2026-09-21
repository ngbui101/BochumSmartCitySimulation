import { itemDefinitions } from '../data/itemDefinitions';
import { subsidyPrograms } from '../data/subsidyPrograms';
import { getEnergyDemandForMonth } from '../data/energyDemand';
import { IMPORT_COST_PER_UNIT, REVENUE_PER_UNIT } from '../data/gameBalance';
import { getWeatherProfileForMonth } from './weatherSimulation';
import type { PlayerAsset } from '../types/assets';
import type { GameState, SubsidyState } from '../types/game';

/** Private reserve available each month; it has no persistent charge state. */
const PRIVATE_STORAGE_DISCHARGE_RATE = 0.25;

export function getSubsidies(state: GameState): SubsidyState {
  return state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };
}

function getItemDefinition(itemType: PlayerAsset['itemType']) {
  return itemDefinitions.find((item) => item.itemType === itemType);
}

function calculateAssetProduction(asset: PlayerAsset, monthIndex: number, weatherSeed?: number): number {
  const itemDefinition = getItemDefinition(asset.itemType);
  const weatherProfile = getWeatherProfileForMonth(monthIndex, weatherSeed);

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

function calculateTotalProduction(activeAssets: PlayerAsset[], monthIndex: number, weatherSeed?: number): number {
  return activeAssets.reduce(
    (sum, asset) => sum + calculateAssetProduction(asset, monthIndex, weatherSeed),
    0
  );
}

function calculateStorageCapacity(activeAssets: PlayerAsset[]): number {
  return activeAssets.reduce((sum, asset) => {
    const itemDefinition = getItemDefinition(asset.itemType);
    return sum + (itemDefinition?.storageValue ?? 0);
  }, 0);
}

function calculateSubsidyCosts(state: GameState): number {
  const subsidies = getSubsidies(state);

  return (
    subsidies.solar.level * subsidyPrograms.solar.monthlyCostPerLevel +
    subsidies.storage.level * subsidyPrograms.storage.monthlyCostPerLevel
  );
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
  const production = calculateTotalProduction(activeAssets, monthIndex, state.weatherSeed);
  const demand = getEnergyDemandForMonth(monthIndex);
  const storageCapacity = calculateStorageCapacity(activeAssets);
  const weatherProfile = getWeatherProfileForMonth(monthIndex, state.weatherSeed);
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

/**
 * Pure accounting shared by the current inventory preview and settlement.
 * Callers choose the inventory and subsidy capacities: settlement activates
 * construction and advances subsidies first; preview uses the current state.
 * No purchase costs are charged here (the reducer charges them on placement).
 */
export function calculateMonthlyBalance(
  state: GameState,
  activeAssets: PlayerAsset[],
  monthIndex: number,
  subsidies: SubsidyState
) {
  const energy = calculateEnergyBalance(state, activeAssets, monthIndex, subsidies);
  const privateSupply = energy.privateSolarProduction + energy.privateStorageDischarge;
  const revenueFromSales = Math.round(Math.max(0, energy.demand - privateSupply) * REVENUE_PER_UNIT);
  const subsidyCosts = calculateSubsidyCosts(state);
  const operatingCosts = activeAssets.reduce(
    (sum, asset) => sum + (getItemDefinition(asset.itemType)?.operatingCost ?? 0), 0
  );

  return {
    ...energy,
    storageCapacity: calculateStorageCapacity(activeAssets),
    revenueFromSales,
    subsidyCosts,
    operatingCosts,
    netMonthlyDelta: revenueFromSales - energy.importCost - operatingCosts - subsidyCosts
  };
}

export type MonthlyBalance = ReturnType<typeof calculateMonthlyBalance>;
