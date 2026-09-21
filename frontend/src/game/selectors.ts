import { calculateMonthlyBalance, getSubsidies } from '../simulation/monthlyBalance';
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

/** Current inventory only; construction and the next subsidy payment are not projected. */
export function getCurrentMonthlyBalance(state: GameState) {
  return calculateMonthlyBalance(
    state,
    state.playerAssets.filter((asset) => asset.status === 'active'),
    state.currentMonthIndex,
    getSubsidies(state)
  );
}

export function getCurrentEnergyDemand(state: GameState): number {
  return getCurrentMonthlyBalance(state).demand;
}

export function getCurrentEnergyProduction(state: GameState): number {
  return getCurrentMonthlyBalance(state).production;
}

export function getStorageCapacity(state: GameState): number {
  return getCurrentMonthlyBalance(state).storageCapacity;
}

export function getCurrentSubsidyCosts(state: GameState): number {
  return getCurrentMonthlyBalance(state).subsidyCosts;
}

export function getCurrentPrivateSolarProduction(state: GameState): number {
  return getCurrentMonthlyBalance(state).privateSolarProduction;
}

export function getCurrentPrivateStorageDischarge(state: GameState): number {
  return getCurrentMonthlyBalance(state).privateStorageDischarge;
}

export function getCurrentEnergySaldo(state: GameState): number {
  return getCurrentMonthlyBalance(state).saldo;
}

export function getCurrentRevenueFromSales(state: GameState): number {
  return getCurrentMonthlyBalance(state).revenueFromSales;
}

export function getCurrentOperatingCosts(state: GameState): number {
  return getCurrentMonthlyBalance(state).operatingCosts;
}

export function getCurrentNetMonthlyDelta(state: GameState): number {
  return getCurrentMonthlyBalance(state).netMonthlyDelta;
}

/** The initial display hides import costs; accounting still includes them. */
export function getCurrentImportCost(state: GameState): number {
  return state.currentMonthIndex === 0 ? 0 : getCurrentMonthlyBalance(state).importCost;
}
