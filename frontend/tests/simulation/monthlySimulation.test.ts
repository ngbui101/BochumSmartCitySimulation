import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { gameReducer } from '../../src/game/reducer';
import { advanceMonth } from '../../src/simulation/monthlySimulation';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

function activeAsset(overrides: Partial<PlayerAsset>): PlayerAsset {
  return {
    id: overrides.id ?? 'asset-1',
    itemType: overrides.itemType ?? 'solar',
    zoneId: overrides.zoneId ?? 'innenstadt',
    position: overrides.position ?? { lat: 51.48, lng: 7.21 },
    status: overrides.status ?? 'active',
    placedMonthIndex: overrides.placedMonthIndex ?? 0,
    activeFromMonthIndex: overrides.activeFromMonthIndex ?? 0,
    purchasePrice: overrides.purchasePrice ?? 1_200_000
  };
}

function withAssets(state: GameState, playerAssets: PlayerAsset[]): GameState {
  return { ...state, playerAssets };
}

describe('advanceMonth', () => {
  it('increments the month, stores a snapshot, clears undo, and refreshes forecast', () => {
    const placed = gameReducer(createInitialGameState(), {
      type: 'PLACE_ASSET',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 }
    });
    const next = advanceMonth(placed);

    expect(next.currentMonthIndex).toBe(1);
    expect(next.monthlyHistory).toHaveLength(1);
    expect(next.monthlyHistory[0]).toMatchObject({
      monthIndex: placed.currentMonthIndex,
      budget: placed.budget,
      kpis: placed.kpis
    });
    expect(next.undoStack).toEqual([]);
    expect(next.forecast.map((month) => month.monthIndex)).toEqual([1, 2, 3]);
  });

  it('activates assets whose build time has completed', () => {
    const placed = gameReducer(createInitialGameState(), {
      type: 'PLACE_ASSET',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 }
    });

    const next = advanceMonth(placed);

    expect(next.playerAssets[0].status).toBe('active');
  });

  it('improves energy autarky from active solar and wind production', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'solar', itemType: 'solar', zoneId: 'innenstadt' }),
      activeAsset({ id: 'wind', itemType: 'wind', zoneId: 'wattenscheid' })
    ]);

    const next = advanceMonth(state);

    expect(next.kpis.energyAutarky).toBeGreaterThan(state.kpis.energyAutarky);
  });

  it('improves supply security from storage and mixed generation', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'solar', itemType: 'solar', zoneId: 'innenstadt' }),
      activeAsset({ id: 'wind', itemType: 'wind', zoneId: 'wattenscheid' }),
      activeAsset({ id: 'storage', itemType: 'storage', zoneId: 'innenstadt' })
    ]);

    const next = advanceMonth(state);

    expect(next.kpis.supplySecurity).toBeGreaterThan(state.kpis.supplySecurity);
  });

  it('can reduce citizen satisfaction for wind in high-sensitivity zones', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'wind-sensitive', itemType: 'wind', zoneId: 'stiepel' })
    ]);

    const next = advanceMonth(state);

    expect(next.kpis.citizenSatisfaction).toBeLessThan(state.kpis.citizenSatisfaction);
  });

  it('updates budget by net monthly delta on advanceMonth', () => {
    const state = createInitialGameState();
    // Initially, demand is 95. Revenue = 3.8M. Import cost = 5.7M. Operating cost = 0.
    // Net delta = -1.9M.
    const next = advanceMonth(state);
    expect(next.budget).toBe(18000000 - 1900000);
  });

  it('finishes the game after month 60', () => {
    const state = { ...createInitialGameState(), currentMonthIndex: 59 };

    const next = advanceMonth(state);

    expect(next.currentMonthIndex).toBe(60);
    expect(next.status).toBe('finished');
  });
});
