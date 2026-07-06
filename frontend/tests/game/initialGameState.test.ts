import { describe, expect, it } from 'vitest';

import { initialAssets } from '../../src/data/initialAssets';
import { createInitialGameState } from '../../src/game/initialGameState';

describe('createInitialGameState', () => {
  it('creates a reproducible new running game state', () => {
    const state = createInitialGameState();

    expect(state.currentMonthIndex).toBe(0);
    expect(state.status).toBe('running');
    expect(state.playerAssets).toEqual([]);
    expect(state.existingAssets).toEqual(initialAssets);
    expect(state.undoStack).toEqual([]);
    expect(state.monthlyHistory).toEqual([]);
    expect(state.subsidies).toEqual({
      solar: { level: 0, privateCapacity: 0 },
      storage: { level: 0, privateCapacity: 0 }
    });
    expect(state.forecast).toHaveLength(3);
    expect(state.budget).toBeGreaterThan(0);
    expect(state.kpis).toEqual({
      energyAutarky: 18,
      citizenSatisfaction: 72,
      supplySecurity: 58
    });
  });
});
