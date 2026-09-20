import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import {
  clearGameState,
  GAME_STATE_STORAGE_KEY,
  getStorageStatus,
  loadGameState,
  saveGameState
} from '../../src/persistence/localStorageStore';

describe('localStorageStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('reports unavailable storage when reading localStorage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    expect(loadGameState()).toBeNull();
    expect(getStorageStatus()).toBe('unavailable');
  });

  it('reports a failed save when localStorage rejects writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    expect(saveGameState(createInitialGameState())).toBe(false);
    expect(getStorageStatus()).toBe('unavailable');
  });

  it('reports a failed clear when localStorage rejects removal', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    expect(clearGameState()).toBe(false);
    expect(getStorageStatus()).toBe('unavailable');
  });
});
