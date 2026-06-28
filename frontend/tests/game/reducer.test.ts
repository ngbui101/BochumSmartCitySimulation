import { describe, expect, it } from 'vitest';

import { itemDefinitions } from '../../src/data/itemDefinitions';
import { createInitialGameState } from '../../src/game/initialGameState';
import { gameReducer } from '../../src/game/reducer';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

const solarCost = itemDefinitions.find((item) => item.itemType === 'solar')?.cost ?? 0;

function makeAsset(overrides: Partial<PlayerAsset>): PlayerAsset {
  return {
    id: overrides.id ?? 'asset-1',
    itemType: overrides.itemType ?? 'solar',
    zoneId: overrides.zoneId ?? 'innenstadt',
    position: overrides.position ?? { lat: 51.48, lng: 7.21 },
    status: overrides.status ?? 'under_construction',
    placedMonthIndex: overrides.placedMonthIndex ?? 0,
    activeFromMonthIndex: overrides.activeFromMonthIndex ?? 1,
    purchasePrice: overrides.purchasePrice ?? solarCost
  };
}

function withPlayerAssets(state: GameState, playerAssets: PlayerAsset[]): GameState {
  return { ...state, playerAssets };
}

describe('gameReducer', () => {
  it('places a valid player asset and charges the budget', () => {
    const state = createInitialGameState();
    const next = gameReducer(state, {
      type: 'PLACE_ASSET',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 }
    });

    expect(next.playerAssets).toHaveLength(1);
    expect(next.playerAssets[0]).toMatchObject({
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 },
      status: 'under_construction',
      placedMonthIndex: 0,
      activeFromMonthIndex: 1,
      purchasePrice: solarCost
    });
    expect(next.budget).toBe(state.budget - solarCost);
  });

  it('rejects invalid placement without changing state', () => {
    const state = createInitialGameState();
    const next = gameReducer(state, {
      type: 'PLACE_ASSET',
      itemType: 'wind',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 }
    });

    expect(next).toBe(state);
  });

  it('rejects placement when budget is too low', () => {
    const state = { ...createInitialGameState(), budget: 1 };
    const next = gameReducer(state, {
      type: 'PLACE_ASSET',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 }
    });

    expect(next).toBe(state);
  });

  it('sells a player asset for 60 percent of the purchase price', () => {
    const asset = makeAsset({ id: 'asset-to-sell', purchasePrice: 1_000_000 });
    const state = withPlayerAssets(createInitialGameState(), [asset]);
    const next = gameReducer(state, { type: 'SELL_ASSET', assetId: 'asset-to-sell' });

    expect(next.playerAssets).toEqual([]);
    expect(next.budget).toBe(state.budget + 600_000);
  });

  it('does not sell existing assets', () => {
    const state = createInitialGameState();
    const existingAssetId = state.existingAssets[0].id;
    const next = gameReducer(state, { type: 'SELL_ASSET', assetId: existingAssetId });

    expect(next).toBe(state);
  });

  it('stores and clears the selected asset id', () => {
    const state = createInitialGameState();
    const selected = gameReducer(state, {
      type: 'SELECT_ASSET',
      assetId: state.existingAssets[0].id
    });
    const cleared = gameReducer(selected, { type: 'CLEAR_SELECTION' });

    expect(selected.selectedAssetId).toBe(state.existingAssets[0].id);
    expect(cleared.selectedAssetId).toBeUndefined();
  });
});
