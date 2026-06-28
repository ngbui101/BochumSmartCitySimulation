import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { advanceMonth } from '../../src/simulation/monthlySimulation';
import { calculateFinalScore } from '../../src/simulation/scoring';

describe('calculateFinalScore', () => {
  it('returns a total score and four endscreen breakdown values between 0 and 100', () => {
    const score = calculateFinalScore(createInitialGameState());

    expect(score.totalScore).toBeGreaterThanOrEqual(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(Object.keys(score.breakdown).sort()).toEqual([
      'budgetEfficiency',
      'citizenSatisfaction',
      'energyAutarky',
      'supplySecurity'
    ]);
    expect(Object.values(score.breakdown).every((value) => value >= 0 && value <= 100)).toBe(true);
    expect(score.qualitativeSummary.length).toBeGreaterThan(0);
  });

  it('calculates budgetEfficiency as an endscore value instead of copying GameState.budget', () => {
    const state = { ...createInitialGameState(), budget: 18_000_000 };
    const score = calculateFinalScore(state);

    expect(score.breakdown.budgetEfficiency).toBe(100);
    expect(score.breakdown.budgetEfficiency).not.toBe(state.budget);
  });

  it('reduces the total score when citizen satisfaction is poor', () => {
    const strongSatisfaction = {
      ...createInitialGameState(),
      kpis: { energyAutarky: 80, citizenSatisfaction: 90, supplySecurity: 80 }
    };
    const poorSatisfaction = {
      ...strongSatisfaction,
      kpis: { ...strongSatisfaction.kpis, citizenSatisfaction: 15 }
    };

    expect(calculateFinalScore(poorSatisfaction).totalScore).toBeLessThan(
      calculateFinalScore(strongSatisfaction).totalScore
    );
  });

  it('reduces the total score when supply security is poor', () => {
    const strongSupply = {
      ...createInitialGameState(),
      kpis: { energyAutarky: 80, citizenSatisfaction: 80, supplySecurity: 90 }
    };
    const poorSupply = {
      ...strongSupply,
      kpis: { ...strongSupply.kpis, supplySecurity: 10 }
    };

    expect(calculateFinalScore(poorSupply).totalScore).toBeLessThan(
      calculateFinalScore(strongSupply).totalScore
    );
  });

  it('attaches final score data when month progression finishes the game', () => {
    const state = { ...createInitialGameState(), currentMonthIndex: 59 };

    const finished = advanceMonth(state);

    expect(finished.status).toBe('finished');
    expect(finished.finalScore).toEqual(calculateFinalScore(finished));
  });
});
