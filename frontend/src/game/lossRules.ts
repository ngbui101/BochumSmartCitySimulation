import type { GameState, LossReason } from '../types/game';
import { calculateFinalScore } from '../simulation/scoring';

export function resolveLossReason(state: Pick<GameState, 'budget' | 'kpis'>): LossReason | null {
  if (state.budget <= 0) {
    return 'bankrupt';
  }

  if (state.kpis.citizenSatisfaction <= 0) {
    return 'voted_out';
  }

  return null;
}

export function applyLossState(state: GameState): GameState {
  const lossReason = resolveLossReason(state);

  if (!lossReason) {
    return state;
  }

  return {
    ...state,
    status: 'lost',
    lossReason,
    finalScore: calculateFinalScore(state)
  };
}
