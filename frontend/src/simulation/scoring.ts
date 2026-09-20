import type { FinalScore, GameState, ScoreBreakdown } from '../types/game';

function getQualitativeSummary(totalScore: number): string {
  if (totalScore >= 36) {
    return 'Hervorragende Smart-City-Balance.';
  }

  if (totalScore >= 26) {
    return 'Starke Entwicklung mit guter Balance.';
  }

  if (totalScore >= 16) {
    return 'Solide Entwicklung mit weiterem Potenzial.';
  }

  return 'Ein schwieriger Start – beim nächsten Versuch wird es besser.';
}

export function calculateFinalScore(state: GameState): FinalScore {
  const breakdown: ScoreBreakdown = {
    budgetPoints: Math.floor(Math.max(0, state.budget) / 1_000_000),
    energyAutarkyPoints: Math.floor(Math.max(0, state.kpis.energyAutarky) / 10),
    citizenSatisfactionPoints: Math.floor(Math.max(0, state.kpis.citizenSatisfaction) / 10),
    supplySecurityPoints: Math.floor(Math.max(0, state.kpis.supplySecurity) / 10)
  };
  const totalScore = Object.values(breakdown).reduce((sum, points) => sum + points, 0);

  return {
    totalScore,
    breakdown,
    qualitativeSummary: getQualitativeSummary(totalScore)
  };
}
