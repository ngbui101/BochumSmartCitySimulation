import type { PlayerAsset } from '../types/assets';
import type { GameState } from '../types/game';

const SELL_REFUND_RATE = 0.6;

export function getUndoTooltip(state: GameState): string {
  const latestUndoEntry = state.undoStack[state.undoStack.length - 1];

  return latestUndoEntry?.description ?? 'Keine Aktion zum Rueckgaengigmachen.';
}

export function getPlayerAssetSellValue(asset: PlayerAsset): number {
  return Math.round(asset.purchasePrice * SELL_REFUND_RATE);
}
