import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { gameReducer } from '../../src/game/reducer';
import { getUndoTooltip } from '../../src/game/selectors';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

function placeSolar(state: GameState, lat = 51.48, lng = 7.21): GameState {
  return gameReducer(state, {
    type: 'PLACE_ASSET',
    itemType: 'solar',
    zoneId: 'innenstadt',
    position: { lat, lng }
  });
}

function placeStorage(state: GameState): GameState {
  return gameReducer(state, {
    type: 'PLACE_ASSET',
    itemType: 'storage',
    zoneId: 'innenstadt',
    position: { lat: 51.481, lng: 7.212 }
  });
}

function withPlayerAssets(state: GameState, playerAssets: PlayerAsset[]): GameState {
  return { ...state, playerAssets };
}

describe('current-month undo', () => {
  it('undoes a placement by removing the asset and refunding the budget', () => {
    const state = createInitialGameState();
    const placed = placeSolar(state);
    const undone = gameReducer(placed, { type: 'UNDO_LAST_ACTION' });

    expect(placed.undoStack).toHaveLength(1);
    expect(undone.playerAssets).toEqual([]);
    expect(undone.budget).toBe(state.budget);
    expect(undone.undoStack).toEqual([]);
  });

  it('undoes multiple actions in last-in-first-out order', () => {
    const state = createInitialGameState();
    const withSolar = placeSolar(state);
    const withStorage = placeStorage(withSolar);
    const undone = gameReducer(withStorage, { type: 'UNDO_LAST_ACTION' });

    expect(withStorage.playerAssets.map((asset) => asset.itemType)).toEqual(['solar', 'storage']);
    expect(undone.playerAssets.map((asset) => asset.itemType)).toEqual(['solar']);
    expect(undone.undoStack).toHaveLength(1);
  });

  it('undoes a sale by restoring the player asset and removing the refund', () => {
    const state = placeSolar(createInitialGameState());
    const asset = state.playerAssets[0];
    const sold = gameReducer(state, { type: 'SELL_ASSET', assetId: asset.id });
    const undone = gameReducer(sold, { type: 'UNDO_LAST_ACTION' });

    expect(sold.playerAssets).toEqual([]);
    expect(undone.playerAssets).toEqual([asset]);
    expect(undone.budget).toBe(state.budget);
  });

  it('does not undo existing assets because they cannot be sold', () => {
    const state = createInitialGameState();
    const unchanged = gameReducer(state, {
      type: 'SELL_ASSET',
      assetId: state.existingAssets[0].id
    });

    expect(unchanged).toBe(state);
    expect(unchanged.undoStack).toEqual([]);
  });

  it('returns a tooltip for the latest undoable action', () => {
    const state = placeSolar(createInitialGameState());

    expect(getUndoTooltip(state)).toContain('Solaranlage');
    expect(getUndoTooltip(createInitialGameState())).toBe('Keine Aktion zum Rueckgaengigmachen.');
  });

  it('clears the current-month undo stack when advancing month through the reducer', () => {
    const state = placeSolar(createInitialGameState());
    const advanced = gameReducer(state, { type: 'ADVANCE_MONTH' });

    expect(advanced.undoStack).toEqual([]);
  });
});
