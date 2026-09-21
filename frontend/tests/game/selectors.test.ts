import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../src/game/initialGameState';
import { getCurrentRevenueFromSales, getCurrentOperatingCosts, getCurrentNetMonthlyDelta, getCurrentSubsidyCosts, getCurrentPrivateSolarProduction } from '../../src/game/selectors';
import type { GameState } from '../../src/types/game';

describe('energy finance selectors', () => {
  it('calculates initial revenue from sales and operating costs', () => {
    const state = createInitialGameState(0);
    // Month 0 demand is 95. Revenue should be 95 * 38,000 = 3,610,000.
    expect(getCurrentRevenueFromSales(state)).toBe(3610000);
    expect(getCurrentOperatingCosts(state)).toBe(0);
    // The preview includes imports even when the initial import-cost display hides them.
    expect(getCurrentNetMonthlyDelta(state)).toBe(-3040000);
  });

  it('includes subsidy costs and private solar import offsets in the current monthly preview', () => {
    const state: GameState = {
      ...createInitialGameState(0),
      subsidies: {
        solar: { level: 2, privateCapacity: 4 },
        storage: { level: 1, privateCapacity: 3 }
      }
    };

    expect(getCurrentSubsidyCosts(state)).toBe(680000);
    expect(getCurrentPrivateSolarProduction(state)).toBe(2.2);
    expect(getCurrentNetMonthlyDelta(state)).toBe(-3625600);
  });
});
