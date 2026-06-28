import { initialAssets } from '../data/initialAssets';
import { weatherProfiles } from '../data/weatherProfiles';
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

function createInitialForecast(currentMonthIndex: number) {
  return [0, 1, 2].map((offset) => {
    const monthIndex = currentMonthIndex + offset;
    const monthOfYear = monthIndex % 12;
    const profile = weatherProfiles[monthOfYear];

    return {
      monthIndex,
      monthOfYear,
      weatherType: profile.weatherType,
      confidence: profile.confidence
    };
  });
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
    forecast: createInitialForecast(0),
    status: 'running'
  };
}
