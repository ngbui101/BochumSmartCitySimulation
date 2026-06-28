import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { canPlaceItem, getRemainingCapacity } from '../../src/simulation/placementRules';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

function makeAsset(overrides: Partial<PlayerAsset>): PlayerAsset {
  return {
    id: overrides.id ?? 'asset-1',
    itemType: overrides.itemType ?? 'solar',
    zoneId: overrides.zoneId ?? 'innenstadt',
    position: overrides.position ?? { lat: 51.48, lng: 7.21 },
    status: overrides.status ?? 'under_construction',
    placedMonthIndex: overrides.placedMonthIndex ?? 0,
    activeFromMonthIndex: overrides.activeFromMonthIndex ?? 1,
    purchasePrice: overrides.purchasePrice ?? 1_200_000
  };
}

function withPlayerAssets(state: GameState, playerAssets: PlayerAsset[]): GameState {
  return { ...state, playerAssets };
}

describe('placementRules', () => {
  it('rejects wind placement in Innenstadt because the zone does not allow it', () => {
    const result = canPlaceItem(createInitialGameState(), 'wind', 'innenstadt');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('nicht erlaubt');
    expect(result.capacity).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it('allows solar placement in Innenstadt while budget and capacity are available', () => {
    const result = canPlaceItem(createInitialGameState(), 'solar', 'innenstadt');

    expect(result).toEqual({
      allowed: true,
      reason: 'Platzierung moeglich.',
      remaining: 10,
      capacity: 10
    });
  });

  it('calculates remaining capacity by item type and zone', () => {
    const state = withPlayerAssets(createInitialGameState(), [
      makeAsset({ id: 'solar-1', itemType: 'solar', zoneId: 'innenstadt' }),
      makeAsset({ id: 'storage-1', itemType: 'storage', zoneId: 'innenstadt' }),
      makeAsset({ id: 'solar-2', itemType: 'solar', zoneId: 'wattenscheid' })
    ]);

    expect(getRemainingCapacity(state, 'solar', 'innenstadt')).toBe(9);
    expect(getRemainingCapacity(state, 'storage', 'innenstadt')).toBe(3);
  });

  it('rejects placement when the zone capacity is exhausted', () => {
    const state = withPlayerAssets(
      createInitialGameState(),
      Array.from({ length: 10 }, (_, index) =>
        makeAsset({ id: `solar-${index}`, itemType: 'solar', zoneId: 'innenstadt' })
      )
    );

    const result = canPlaceItem(state, 'solar', 'innenstadt');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Kapazitaet');
    expect(result.remaining).toBe(0);
  });

  it('rejects placement when the current budget is too low', () => {
    const state = { ...createInitialGameState(), budget: 1 };

    const result = canPlaceItem(state, 'solar', 'innenstadt');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Budget');
    expect(result.remaining).toBe(10);
  });
});
