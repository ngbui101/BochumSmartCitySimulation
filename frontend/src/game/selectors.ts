import { itemDefinitions } from '../data/itemDefinitions';
import { getEnergyDemandForMonth } from '../data/energyDemand';
import { getWeatherProfileForMonth } from '../simulation/weatherSimulation';
import type { PlayerAsset } from '../types/assets';
import type { GameState } from '../types/game';

const SELL_REFUND_RATE = 0.6;

export function getUndoTooltip(state: GameState): string {
  const latestUndoEntry = state.undoStack[state.undoStack.length - 1];

  return latestUndoEntry?.description ?? 'Keine Aktion zum Rückgängigmachen.';
}

export function getPlayerAssetSellValue(asset: PlayerAsset): number {
  return Math.round(asset.purchasePrice * SELL_REFUND_RATE);
}

function getItemDefinition(itemType: PlayerAsset['itemType']) {
  return itemDefinitions.find((item) => item.itemType === itemType);
}

/** Berechnet die Energieproduktion eines aktiven Assets für den aktuellen Monat. */
function getAssetProduction(asset: PlayerAsset, monthIndex: number): number {
  const itemDefinition = getItemDefinition(asset.itemType);
  const weatherProfile = getWeatherProfileForMonth(monthIndex);

  if (!itemDefinition) return 0;
  if (asset.itemType === 'solar') return itemDefinition.productionValue * weatherProfile.solarFactor;
  if (asset.itemType === 'wind') return itemDefinition.productionValue * weatherProfile.windFactor;
  return 0;
}

/** Aktueller monatlicher Strombedarf Bochumhums (saisonal). */
export function getCurrentEnergyDemand(state: GameState): number {
  return getEnergyDemandForMonth(state.currentMonthIndex);
}

/** Aktuelle Gesamtproduktion aller aktiven Anlagen (wetterabhängig). */
export function getCurrentEnergyProduction(state: GameState): number {
  const activeAssets = state.playerAssets.filter((a) => a.status === 'active');
  return activeAssets.reduce((sum, asset) => sum + getAssetProduction(asset, state.currentMonthIndex), 0);
}

/** Maximale Speicherkapazität aller aktiven Speicher-Assets in Einheiten. */
export function getStorageCapacity(state: GameState): number {
  return state.playerAssets
    .filter((a) => a.status === 'active')
    .reduce((sum, asset) => {
      const def = getItemDefinition(asset.itemType);
      return sum + (def?.storageValue ?? 0);
    }, 0);
}

/**
 * Aktueller Energie-Saldo: (Produktion + gespeicherte Energie) - Bedarf.
 * Negativ = Defizit (Importkosten), Positiv = Überschuss (kann gespeichert werden).
 */
export function getCurrentEnergySaldo(state: GameState): number {
  const production = getCurrentEnergyProduction(state);
  const demand = getCurrentEnergyDemand(state);
  return production + state.storedEnergy - demand;
}

/**
 * Voraussichtliche Importkosten für den aktuellen Monat.
 * 0 wenn kein Defizit. Gilt NICHT für Monat 0 (Schonfrist).
 */
export function getCurrentImportCost(state: GameState): number {
  if (state.currentMonthIndex === 0) return 0;
  const saldo = getCurrentEnergySaldo(state);
  return saldo < 0 ? Math.abs(saldo) * 60_000 : 0;
}

export function getCurrentRevenueFromSales(state: GameState): number {
  const demand = getCurrentEnergyDemand(state);
  return demand * 40_000;
}

export function getCurrentOperatingCosts(state: GameState): number {
  const activeAssets = state.playerAssets.filter((a) => a.status === 'active');
  return activeAssets.reduce((sum, asset) => {
    const def = getItemDefinition(asset.itemType);
    return sum + (def?.operatingCost ?? 0);
  }, 0);
}

export function getCurrentNetMonthlyDelta(state: GameState): number {
  const revenue = getCurrentRevenueFromSales(state);
  const saldo = getCurrentEnergySaldo(state);
  const rawImportCost = saldo < 0 ? Math.abs(saldo) * 60_000 : 0;
  const operatingCosts = getCurrentOperatingCosts(state);
  return revenue - rawImportCost - operatingCosts;
}
