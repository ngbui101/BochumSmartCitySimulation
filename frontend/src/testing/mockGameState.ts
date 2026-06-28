import type { GameState } from '../types/game';
import { initialAssets } from '../data/initialAssets';

export const initialMockState: GameState = {
  gameId: 'mock-initial-game',
  currentMonthIndex: 0, // Month 1
  budget: 18000000,
  kpis: {
    energyAutarky: 18,
    citizenSatisfaction: 72,
    supplySecurity: 58
  },
  playerAssets: [],
  existingAssets: initialAssets,
  undoStack: [],
  monthlyHistory: [],
  forecast: [
    { monthIndex: 0, monthOfYear: 0, weatherType: 'windy', confidence: 'high' },
    { monthIndex: 1, monthOfYear: 1, weatherType: 'windy', confidence: 'high' },
    { monthIndex: 2, monthOfYear: 2, weatherType: 'mixed', confidence: 'high' }
  ],
  status: 'running'
};

export const midgameMockState: GameState = {
  gameId: 'mock-midgame-game',
  currentMonthIndex: 13, // Month 14
  budget: 13400000,
  kpis: {
    energyAutarky: 34,
    citizenSatisfaction: 68,
    supplySecurity: 62
  },
  playerAssets: [
    {
      id: 'mock-player-solar-1',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.482, lng: 7.218 },
      status: 'active',
      placedMonthIndex: 3,
      activeFromMonthIndex: 4,
      purchasePrice: 1200000
    },
    {
      id: 'mock-player-wind-1',
      itemType: 'wind',
      zoneId: 'gerthe_harpen',
      position: { lat: 51.520, lng: 7.260 },
      status: 'active',
      placedMonthIndex: 6,
      activeFromMonthIndex: 7,
      purchasePrice: 3400000
    }
  ],
  existingAssets: initialAssets,
  undoStack: [],
  monthlyHistory: [
    { monthIndex: 0, budget: 18000000, kpis: { energyAutarky: 18, citizenSatisfaction: 72, supplySecurity: 58 } },
    { monthIndex: 1, budget: 17800000, kpis: { energyAutarky: 19, citizenSatisfaction: 72, supplySecurity: 58 } },
    { monthIndex: 2, budget: 17600000, kpis: { energyAutarky: 20, citizenSatisfaction: 72, supplySecurity: 58 } },
    { monthIndex: 3, budget: 16400000, kpis: { energyAutarky: 20, citizenSatisfaction: 71, supplySecurity: 58 } },
    { monthIndex: 4, budget: 16300000, kpis: { energyAutarky: 23, citizenSatisfaction: 70, supplySecurity: 59 } },
    { monthIndex: 5, budget: 16200000, kpis: { energyAutarky: 23, citizenSatisfaction: 70, supplySecurity: 59 } },
    { monthIndex: 6, budget: 12800000, kpis: { energyAutarky: 23, citizenSatisfaction: 69, supplySecurity: 59 } },
    { monthIndex: 7, budget: 12700000, kpis: { energyAutarky: 27, citizenSatisfaction: 68, supplySecurity: 60 } },
    { monthIndex: 8, budget: 12900000, kpis: { energyAutarky: 28, citizenSatisfaction: 69, supplySecurity: 60 } },
    { monthIndex: 9, budget: 13100000, kpis: { energyAutarky: 29, citizenSatisfaction: 70, supplySecurity: 60 } },
    { monthIndex: 10, budget: 13300000, kpis: { energyAutarky: 29, citizenSatisfaction: 71, supplySecurity: 60 } },
    { monthIndex: 11, budget: 13500000, kpis: { energyAutarky: 29, citizenSatisfaction: 72, supplySecurity: 60 } },
    { monthIndex: 12, budget: 13800000, kpis: { energyAutarky: 29, citizenSatisfaction: 72, supplySecurity: 60 } }
  ],
  forecast: [
    { monthIndex: 13, monthOfYear: 1, weatherType: 'windy', confidence: 'high' },
    { monthIndex: 14, monthOfYear: 2, weatherType: 'mixed', confidence: 'high' },
    { monthIndex: 15, monthOfYear: 3, weatherType: 'mixed', confidence: 'high' }
  ],
  status: 'running'
};

export const finishMockState: GameState = {
  gameId: 'mock-finish-game',
  currentMonthIndex: 59, // Month 60
  budget: 8500000,
  kpis: {
    energyAutarky: 65,
    citizenSatisfaction: 70,
    supplySecurity: 78
  },
  playerAssets: [
    {
      id: 'mock-player-solar-1',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.482, lng: 7.218 },
      status: 'active',
      placedMonthIndex: 3,
      activeFromMonthIndex: 4,
      purchasePrice: 1200000
    },
    {
      id: 'mock-player-wind-1',
      itemType: 'wind',
      zoneId: 'gerthe_harpen',
      position: { lat: 51.520, lng: 7.260 },
      status: 'active',
      placedMonthIndex: 6,
      activeFromMonthIndex: 7,
      purchasePrice: 3400000
    },
    {
      id: 'mock-player-storage-1',
      itemType: 'storage',
      zoneId: 'wattenscheid',
      position: { lat: 51.480, lng: 7.147 },
      status: 'active',
      placedMonthIndex: 15,
      activeFromMonthIndex: 16,
      purchasePrice: 2500000
    }
  ],
  existingAssets: initialAssets,
  undoStack: [],
  monthlyHistory: [],
  forecast: [
    { monthIndex: 59, monthOfYear: 11, weatherType: 'stormy', confidence: 'high' },
    { monthIndex: 60, monthOfYear: 0, weatherType: 'windy', confidence: 'medium' },
    { monthIndex: 61, monthOfYear: 1, weatherType: 'windy', confidence: 'low' }
  ],
  status: 'finished',
  finalScore: {
    totalScore: 78,
    breakdown: {
      energyAutarky: 65,
      budgetEfficiency: 82,
      citizenSatisfaction: 70,
      supplySecurity: 78
    },
    qualitativeSummary: 'Great job! Bochum is now significantly more autarkic with satisfied citizens.'
  }
};
