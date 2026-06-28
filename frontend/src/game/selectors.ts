import type { GameState } from '../types/game';

export function getUndoTooltip(state: GameState): string {
  const latestUndoEntry = state.undoStack[state.undoStack.length - 1];

  return latestUndoEntry?.description ?? 'Keine Aktion zum Rueckgaengigmachen.';
}
