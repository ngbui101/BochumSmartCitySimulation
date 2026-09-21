import { GAME_DURATION_MONTHS } from '../data/gameBalance';
import type { PlayerAsset } from '../types/assets';
import type { GameState } from '../types/game';
import { calculateFinalScore } from './scoring';
import { resolveLossReason } from '../game/lossRules';
import { createForecast } from './weatherSimulation';
import { calculateMonthlyBalance } from './monthlyBalance';
import { calculateNextSubsidies } from './subsidySimulation';
import { calculateNextKpis } from './kpiCalculation';

function activateCompletedAssets(state: GameState, nextMonthIndex: number): PlayerAsset[] {
  return state.playerAssets.map((asset) => {
    if (asset.status === 'under_construction' && asset.activeFromMonthIndex <= nextMonthIndex) {
      return {
        ...asset,
        status: 'active'
      };
    }

    return asset;
  });
}

function calculateNextBudget(
  state: GameState,
  netMonthlyDelta: number
): number {
  return Math.max(0, Math.round(state.budget + netMonthlyDelta));
}

export function advanceMonth(state: GameState): GameState {
  if (state.status !== 'running') {
    return state;
  }

  const nextMonthIndex = state.currentMonthIndex + 1;
  const playerAssets = activateCompletedAssets(state, nextMonthIndex);
  const activeAssets = playerAssets.filter((asset) => asset.status === 'active');
  const status = nextMonthIndex >= GAME_DURATION_MONTHS ? 'finished' : 'running';
  const subsidyResult = calculateNextSubsidies(state);
  const subsidies = subsidyResult.subsidies;

  const energyBalance = calculateMonthlyBalance(state, activeAssets, state.currentMonthIndex, subsidies);
  const { revenueFromSales, subsidyCosts, operatingCosts, netMonthlyDelta } = energyBalance;

  const nextState: GameState = {
    ...state,
    currentMonthIndex: nextMonthIndex,
    budget: calculateNextBudget(state, netMonthlyDelta),
    kpis: calculateNextKpis(state, activeAssets, subsidies, energyBalance),
    playerAssets,
    privateAssets: subsidyResult.privateAssets,
    subsidies,
    storedEnergy: energyBalance.newStoredEnergy,
    undoStack: [],
    monthlyHistory: [
      ...state.monthlyHistory,
      {
        monthIndex: state.currentMonthIndex,
        budget: state.budget,
        kpis: state.kpis,
        energyDemand: energyBalance.demand,
        energyProduction: energyBalance.production,
        energySaldo: energyBalance.saldo,
        importCost: energyBalance.importCost,
        storedEnergy: state.storedEnergy,
        revenueFromSales,
        operatingCosts,
        subsidyCosts,
        privateSolarProduction: energyBalance.privateSolarProduction,
        privateStorageDischarge: energyBalance.privateStorageDischarge,
        netMonthlyDelta
      }
    ],
    forecast: createForecast(nextMonthIndex, state.weatherSeed),
    status
  };

  const lossReason = resolveLossReason(nextState);

  if (lossReason) {
    return {
      ...nextState,
      status: 'lost',
      lossReason,
      finalScore: calculateFinalScore(nextState)
    };
  }

  return status === 'finished'
    ? { ...nextState, finalScore: calculateFinalScore(nextState) }
    : nextState;
}
