import { describe, expect, it } from 'vitest';

import { createInitialGameState } from '../../src/game/initialGameState';
import { resolveLossReason } from '../../src/game/lossRules';

describe('resolveLossReason', () => {
  it('returns bankrupt when the budget reaches zero', () => {
    const state = { ...createInitialGameState(), budget: 0 };

    expect(resolveLossReason(state)).toBe('bankrupt');
  });

  it('returns voted_out when citizen satisfaction reaches zero', () => {
    const state = {
      ...createInitialGameState(),
      kpis: { ...createInitialGameState().kpis, citizenSatisfaction: 0 }
    };

    expect(resolveLossReason(state)).toBe('voted_out');
  });

  it('prioritizes bankruptcy when both loss conditions are true', () => {
    const state = {
      ...createInitialGameState(),
      budget: 0,
      kpis: { ...createInitialGameState().kpis, citizenSatisfaction: 0 }
    };

    expect(resolveLossReason(state)).toBe('bankrupt');
  });

  it('returns null while both loss thresholds are still above zero', () => {
    const state = {
      ...createInitialGameState(),
      budget: 1,
      kpis: { ...createInitialGameState().kpis, citizenSatisfaction: 1 }
    };

    expect(resolveLossReason(state)).toBeNull();
  });
});
