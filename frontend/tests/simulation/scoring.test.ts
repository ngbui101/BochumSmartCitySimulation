import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { advanceMonth } from '../../src/simulation/monthlySimulation';
import { calculateFinalScore } from '../../src/simulation/scoring';

describe('calculateFinalScore', () => {
  it('awards one point per million euros and per ten KPI percent', () => {
    const state = {
      ...createInitialGameState(),
      budget: 12_999_999,
      kpis: { energyAutarky: 48, citizenSatisfaction: 72, supplySecurity: 65 }
    };
    const score = calculateFinalScore(state);

    expect(score.totalScore).toBe(29);
    expect(Object.keys(score.breakdown).sort()).toEqual([
      'budgetPoints',
      'citizenSatisfactionPoints',
      'energyAutarkyPoints',
      'supplySecurityPoints'
    ]);
    expect(score.breakdown).toEqual({
      budgetPoints: 12,
      energyAutarkyPoints: 4,
      citizenSatisfactionPoints: 7,
      supplySecurityPoints: 6
    });
    expect(score.qualitativeSummary.length).toBeGreaterThan(0);
  });

  it('rounds each category down and never awards negative points', () => {
    const state = {
      ...createInitialGameState(),
      budget: -1,
      kpis: { energyAutarky: 9, citizenSatisfaction: 19, supplySecurity: 0 }
    };
    const score = calculateFinalScore(state);

    expect(score.breakdown).toEqual({
      budgetPoints: 0,
      energyAutarkyPoints: 0,
      citizenSatisfactionPoints: 1,
      supplySecurityPoints: 0
    });
    expect(score.totalScore).toBe(1);
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
