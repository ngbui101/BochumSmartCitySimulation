import { beforeEach, describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import {
  clearGameState,
  GAME_STATE_STORAGE_KEY,
  loadGameState,
  saveGameState
} from '../../src/persistence/localStorageStore';

describe('localStorageStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a valid game state', () => {
    const state = createInitialGameState();

    saveGameState(state);

    expect(loadGameState()).toEqual(state);
  });

  it('clears the saved game state', () => {
    saveGameState(createInitialGameState());

    clearGameState();

    expect(loadGameState()).toBeNull();
  });

  it('returns null for invalid JSON without throwing', () => {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, '{not valid json');

    expect(loadGameState()).toBeNull();
  });

  it('returns null for an unsupported storage version', () => {
    localStorage.setItem(
      GAME_STATE_STORAGE_KEY,
      JSON.stringify({ version: 999, state: createInitialGameState() })
    );

    expect(loadGameState()).toBeNull();
  });

  it('removes legacy existing assets when loading a saved game', () => {
    const state = createInitialGameState();

    localStorage.setItem(
      GAME_STATE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          ...state,
          existingAssets: [
            {
              id: 'legacy-existing-asset',
              name: 'Legacy-Anlage',
              assetTypeLabel: 'Solaranlage',
              zoneId: 'mitte',
              position: { lat: 51.48, lng: 7.22 },
              statusLabel: 'Bestand',
              roleDescription: 'Legacy',
              modifiable: false,
              dataConfidence: 'mvp-placeholder'
            }
          ]
        }
      })
    );

    expect(loadGameState()?.existingAssets).toEqual([]);
  });
});
