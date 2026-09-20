import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';

describe('createInitialGameState', () => {
  it('creates a reproducible new running game state', () => {
    const state = createInitialGameState(42);

    expect(state.weatherSeed).toBe(42);
    expect(state.currentMonthIndex).toBe(0);
    expect(state.status).toBe('running');
    expect(state.playerAssets).toEqual([]);
    expect(state.existingAssets).toEqual([]);
    expect(state.undoStack).toEqual([]);
    expect(state.monthlyHistory).toEqual([]);
    expect(state.subsidies).toEqual({
      solar: { level: 0, privateCapacity: 0 },
      storage: { level: 0, privateCapacity: 0 }
    });
    expect(state.forecast).toHaveLength(3);
    expect(state.budget).toBeGreaterThan(0);
    expect(state.kpis).toEqual({
      energyAutarky: 0,
      citizenSatisfaction: 50,
      supplySecurity: 0
    });
  });

  it('creates a non-zero seed for a new session when no seed is supplied', () => {
    expect(createInitialGameState().weatherSeed).toBeGreaterThan(0);
  });
});
