import { describe, expect, it } from 'vitest';
import { initialMockState, midgameMockState, finishMockState } from '../../src/testing/mockGameState';

describe('mockGameState', () => {
  it('should export a valid initialMockState', () => {
    expect(initialMockState).toBeDefined();
    expect(initialMockState.currentMonthIndex).toBe(0);
    expect(initialMockState.budget).toBe(18000000);
    expect(initialMockState.kpis.energyAutarky).toBe(18);
    expect(initialMockState.kpis.citizenSatisfaction).toBe(72);
    expect(initialMockState.kpis.supplySecurity).toBe(58);
    expect(initialMockState.forecast).toHaveLength(3);
    expect(initialMockState.status).toBe('running');
  });

  it('should export a valid midgameMockState with 2 player assets', () => {
    expect(midgameMockState).toBeDefined();
    expect(midgameMockState.currentMonthIndex).toBe(13); // Month 14
    expect(midgameMockState.budget).toBe(13400000);
    expect(midgameMockState.kpis.energyAutarky).toBe(34);
    expect(midgameMockState.kpis.citizenSatisfaction).toBe(68);
    expect(midgameMockState.kpis.supplySecurity).toBe(62);
    expect(midgameMockState.playerAssets).toHaveLength(2);
    expect(midgameMockState.forecast).toHaveLength(3);
    expect(midgameMockState.status).toBe('running');
  });

  it('should export a valid finishMockState in finished status', () => {
    expect(finishMockState).toBeDefined();
    expect(finishMockState.currentMonthIndex).toBe(59); // Month 60
    expect(finishMockState.status).toBe('finished');
    expect(finishMockState.finalScore).toBeDefined();
    expect(finishMockState.finalScore?.totalScore).toBeGreaterThan(0);
  });
});
