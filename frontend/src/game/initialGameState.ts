import { STARTING_BUDGET } from '../data/gameBalance';
import { createForecast, createRandomWeatherSeed } from '../simulation/weatherSimulation';
import type { GameState } from '../types/game';

const STARTING_KPIS = {
  energyAutarky: 0,
  citizenSatisfaction: 50,
  supplySecurity: 0
};

function createGameId(): string {
  return `mvp1-${Date.now().toString(36)}`;
}

export function createInitialGameState(weatherSeed = createRandomWeatherSeed()): GameState {
  return {
    gameId: createGameId(),
    weatherSeed,
    currentMonthIndex: 0,
    budget: STARTING_BUDGET,
    kpis: STARTING_KPIS,
    playerAssets: [],
    existingAssets: [],
    privateAssets: [],
    undoStack: [],
    monthlyHistory: [],
    subsidies: {
      solar: { level: 0, privateCapacity: 0 },
      storage: { level: 0, privateCapacity: 0 }
    },
    forecast: createForecast(0, weatherSeed),
    storedEnergy: 0,
    status: 'running'
  };
}
