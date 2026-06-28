import type { FinalScore, GameState, ScoreBreakdown } from '../types/game';

const STARTING_BUDGET = 18_000_000;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateBudgetEfficiency(budget: number): number {
  return clampScore((budget / STARTING_BUDGET) * 100);
}

function getQualitativeSummary(totalScore: number): string {
  if (totalScore >= 85) {
    return 'Exzellente Smart-City-Balance.';
  }

  if (totalScore >= 70) {
    return 'Starke Energiewende mit kleinen Zielkonflikten.';
  }

  if (totalScore >= 50) {
    return 'Solide Entwicklung mit erkennbarem Verbesserungsbedarf.';
  }

  return 'Riskanter Ausbau mit deutlichen Schwachstellen.';
}

export function calculateFinalScore(state: GameState): FinalScore {
  const breakdown: ScoreBreakdown = {
    energyAutarky: clampScore(state.kpis.energyAutarky),
    budgetEfficiency: calculateBudgetEfficiency(state.budget),
    citizenSatisfaction: clampScore(state.kpis.citizenSatisfaction),
    supplySecurity: clampScore(state.kpis.supplySecurity)
  };
  const totalScore = clampScore(
    breakdown.energyAutarky * 0.35 +
      breakdown.budgetEfficiency * 0.2 +
      breakdown.citizenSatisfaction * 0.2 +
      breakdown.supplySecurity * 0.25
  );

  return {
    totalScore,
    breakdown,
    qualitativeSummary: getQualitativeSummary(totalScore)
  };
}
