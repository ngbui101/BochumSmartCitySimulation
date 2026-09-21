import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/initialGameState';
import { getCurrentMonthlyBalance, getCurrentImportCost } from '../../src/game/selectors';
import { advanceMonth } from '../../src/simulation/monthlySimulation';
import type { PlayerAsset } from '../../src/types/assets';
import type { GameState } from '../../src/types/game';

const storage: PlayerAsset = {
  id: 'storage', itemType: 'storage', zoneId: 'mitte',
  position: { lat: 51.48, lng: 7.21 }, status: 'active',
  placedMonthIndex: 0, activeFromMonthIndex: 0, purchasePrice: 1_700_000
};

describe('shared monthly balance', () => {
  it('charges imports in the first settlement while hiding them in the initial display', () => {
    const state = createInitialGameState(0);
    expect(getCurrentImportCost(state)).toBe(0);
    expect(getCurrentMonthlyBalance(state)).toMatchObject({
      demand: 95, production: 0, saldo: -95, importCost: 6_650_000,
      revenueFromSales: 3_610_000, netMonthlyDelta: -3_040_000
    });
    expect(advanceMonth(state).budget).toBe(14_960_000);
  });

  it('uses public stored energy before the limited private reserve', () => {
    const state: GameState = {
      ...createInitialGameState(0), playerAssets: [storage], storedEnergy: 10,
      subsidies: {
        solar: { level: 0, privateCapacity: 0 },
        storage: { level: 0, privateCapacity: 40 }
      }
    };
    expect(getCurrentMonthlyBalance(state)).toMatchObject({
      storageCapacity: 10, saldo: -75, privateStorageDischarge: 10,
      newStoredEnergy: 0, importCost: 5_250_000,
      revenueFromSales: 3_230_000, operatingCosts: 45_000,
      netMonthlyDelta: -2_065_000
    });
  });

  it('caps stored surplus and does not sell privately generated electricity', () => {
    const state: GameState = {
      ...createInitialGameState(0), playerAssets: [storage],
      subsidies: {
        solar: { level: 0, privateCapacity: 200 },
        storage: { level: 0, privateCapacity: 40 }
      }
    };
    expect(getCurrentMonthlyBalance(state)).toMatchObject({
      privateSolarProduction: 110, privateStorageDischarge: 0,
      saldo: 15, newStoredEnergy: 10, importCost: 0,
      revenueFromSales: 0, netMonthlyDelta: -45_000
    });
  });

  it.each([0, 3, 6, 11, 24, 59])('matches settlement without new construction at month %i', (month) => {
    const state: GameState = {
      ...createInitialGameState(17), currentMonthIndex: month,
      playerAssets: [storage], storedEnergy: 5,
      subsidies: {
        solar: { level: 0, privateCapacity: 14 },
        storage: { level: 0, privateCapacity: 10 }
      }
    };
    const before = JSON.stringify(state);
    const balance = getCurrentMonthlyBalance(state);
    const next = advanceMonth(state);
    expect(next.monthlyHistory[next.monthlyHistory.length - 1]).toMatchObject({
      energyProduction: balance.production, energyDemand: balance.demand,
      energySaldo: balance.saldo, importCost: balance.importCost,
      revenueFromSales: balance.revenueFromSales,
      operatingCosts: balance.operatingCosts, subsidyCosts: balance.subsidyCosts,
      netMonthlyDelta: balance.netMonthlyDelta
    });
    expect(next.storedEnergy).toBe(balance.newStoredEnergy);
    expect(JSON.stringify(state)).toBe(before);
  });
});
