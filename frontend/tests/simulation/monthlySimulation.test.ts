import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { gameReducer } from '../../src/game/reducer';
import { advanceMonth } from '../../src/simulation/monthlySimulation';
import { findZoneForPoint } from '../../src/simulation/zoneDetection';
import { bochumZonesGeoJson } from '../../src/data/bochumZones';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

function activeAsset(overrides: Partial<PlayerAsset>): PlayerAsset {
  return {
    id: overrides.id ?? 'asset-1',
    itemType: overrides.itemType ?? 'solar',
    zoneId: overrides.zoneId ?? 'mitte',
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
      zoneId: 'mitte',
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
      zoneId: 'mitte',
      position: { lat: 51.48, lng: 7.21 }
    });

    const next = advanceMonth(placed);

    expect(next.playerAssets[0].status).toBe('active');
  });

  it('improves energy autarky from active solar and wind production', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'solar', itemType: 'solar', zoneId: 'mitte' }),
      activeAsset({ id: 'wind', itemType: 'wind', zoneId: 'wattenscheid' })
    ]);

    const next = advanceMonth(state);

    expect(next.kpis.energyAutarky).toBeGreaterThan(state.kpis.energyAutarky);
  });

  it('improves supply security from storage and mixed generation', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'solar', itemType: 'solar', zoneId: 'mitte' }),
      activeAsset({ id: 'wind', itemType: 'wind', zoneId: 'wattenscheid' }),
      activeAsset({ id: 'storage', itemType: 'storage', zoneId: 'mitte' })
    ]);

    const next = advanceMonth(state);

    expect(next.kpis.supplySecurity).toBeGreaterThan(state.kpis.supplySecurity);
  });

  it('can reduce citizen satisfaction for wind in high-sensitivity zones', () => {
    const state = withAssets(createInitialGameState(), [
      activeAsset({ id: 'wind-sensitive', itemType: 'wind', zoneId: 'sued' })
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

  it('charges active subsidy programs monthly and grows private adoption', () => {
    const state: GameState = {
      ...createInitialGameState(),
      subsidies: {
        solar: { level: 2, privateCapacity: 0 },
        storage: { level: 1, privateCapacity: 0 }
      }
    };

    const next = advanceMonth(state);

    expect(next.subsidies?.solar.privateCapacity).toBe(4);
    expect(next.subsidies?.storage.privateCapacity).toBe(3);
    expect(next.monthlyHistory[0]).toMatchObject({
      subsidyCosts: 680000,
      privateSolarProduction: 2.2,
      privateStorageDischarge: 0.75
    });
    expect(next.monthlyHistory[0].netMonthlyDelta).toBe(-2403000);
    expect(next.budget).toBe(15597000);
  });

  it('private solar reduces import costs without increasing city electricity sales', () => {
    const state: GameState = {
      ...createInitialGameState(),
      subsidies: {
        solar: { level: 3, privateCapacity: 12 },
        storage: { level: 0, privateCapacity: 0 }
      }
    };

    const next = advanceMonth(state);

    expect(next.monthlyHistory[0].privateSolarProduction).toBe(9.9);
    expect(next.monthlyHistory[0].revenueFromSales).toBe(3800000);
    expect(next.monthlyHistory[0].importCost).toBe(5106000);
    expect(next.monthlyHistory[0].subsidyCosts).toBe(750000);
  });

  it('plots a private solar asset at each cumulative 600k solar subsidy threshold and keeps the remainder', () => {
    const state: GameState = {
      ...createInitialGameState(),
      subsidies: {
        solar: { level: 3, privateCapacity: 0, spendAccumulator: 0 },
        storage: { level: 0, privateCapacity: 0, spendAccumulator: 0 }
      }
    };

    const firstMonth = advanceMonth(state);
    const secondMonth = advanceMonth(firstMonth);

    expect(firstMonth.privateAssets).toHaveLength(1);
    expect(firstMonth.privateAssets?.[0]).toMatchObject({
      itemType: 'solar',
      assetTypeLabel: 'Solaranlage (privat)',
      operatingCost: 0,
      modifiable: false,
      sellable: false
    });
    expect(findZoneForPoint(firstMonth.privateAssets![0].position, bochumZonesGeoJson)).toBe(
      firstMonth.privateAssets![0].zoneId
    );
    expect(firstMonth.subsidies?.solar.spendAccumulator).toBe(150000);
    expect(secondMonth.privateAssets).toHaveLength(2);
    expect(secondMonth.subsidies?.solar.spendAccumulator).toBe(300000);
  });

  it('keeps solar and storage subsidy thresholds separate', () => {
    const state: GameState = {
      ...createInitialGameState(),
      subsidies: {
        solar: { level: 0, privateCapacity: 0, spendAccumulator: 0 },
        storage: { level: 3, privateCapacity: 0, spendAccumulator: 0 }
      }
    };

    const firstMonth = advanceMonth(state);
    const secondMonth = advanceMonth(firstMonth);

    expect(firstMonth.privateAssets).toHaveLength(0);
    expect(firstMonth.subsidies?.storage.spendAccumulator).toBe(540000);
    expect(secondMonth.privateAssets).toHaveLength(1);
    expect(secondMonth.privateAssets?.[0]).toMatchObject({
      itemType: 'storage',
      assetTypeLabel: 'Energiespeicher (privat)',
      operatingCost: 0,
      modifiable: false,
      sellable: false
    });
    expect(secondMonth.subsidies?.storage.spendAccumulator).toBe(480000);
  });

  it('finishes the game after month 60', () => {
    const state = { ...createInitialGameState(), currentMonthIndex: 59 };

    const next = advanceMonth(state);

    expect(next.currentMonthIndex).toBe(60);
    expect(next.status).toBe('finished');
  });
});
