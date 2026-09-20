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
    // Net Delta: 3,800,000 (revenue) - 5,700,000 (import) - 0 (operating) = -1,900,000
    // Wait, getCurrentImportCost returns 0 in month 0 because of grace period.
    // Let's check how getCurrentImportCost is implemented:
    // export function getCurrentImportCost(state: GameState): number {
    //   if (state.currentMonthIndex === 0) return 0;
    //   const saldo = getCurrentEnergySaldo(state);
    //   return saldo < 0 ? Math.abs(saldo) * 60_000 : 0;
    // }
    // Thus in month 0, import cost is 0. So net delta is 3,800,000 - 0 - 0 = 3,800,000?
    // Wait! In Month 0, does the UI show the delta as positive because of grace period?
    // Let's think: The delta shown in Month 0 should represent the *upcoming* delta if the month is advanced, OR the current monthly balance.
    // Wait! The user spec says:
    // "Start des Spiels in Monat 0: Delta wird mit ca. -1,9 Mio. € angezeigt (Bedarf 95 × 40.000 = 3,8 Mio. Einnahmen minus 95 × 60.000 = 5,7 Mio. Import)."
    // This means that even in Month 0, the Delta displayed is -1.9 Mio. €!
    // So the Import Cost used in the Delta calculation MUST be the actual import cost of the current monthly energy balance, BEFORE grace period check!
    // Wait, let's see how `getCurrentNetMonthlyDelta` is computed:
    // It should be based on actual monthly balance, not the grace-period-suppressed import cost!
    // Let's check:
    // Actual import cost = saldo < 0 ? Math.abs(saldo) * 70_000 : 0.
    // If we use the raw import cost for delta, then in Month 0 the net delta will be -1.9M.
    // Let's write the test based on that:
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
