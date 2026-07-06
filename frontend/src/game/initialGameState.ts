import { initialAssets } from '../data/initialAssets';
import { createForecast } from '../simulation/weatherSimulation';
import type { GameState } from '../types/game';

const STARTING_BUDGET = 18_000_000;

const STARTING_KPIS = {
  energyAutarky: 18,
  citizenSatisfaction: 72,
  supplySecurity: 58
};

function createGameId(): string {
  return `mvp1-${Date.now().toString(36)}`;
}

export function createInitialGameState(): GameState {
  return {
    gameId: createGameId(),
    currentMonthIndex: 0,
    budget: STARTING_BUDGET,
    kpis: STARTING_KPIS,
    playerAssets: [],
    existingAssets: initialAssets,
    undoStack: [],
    monthlyHistory: [],
    subsidies: {
      solar: { level: 0, privateCapacity: 0 },
      storage: { level: 0, privateCapacity: 0 }
    },
    forecast: createForecast(0),
    storedEnergy: 0,
    status: 'running'
  };
}
