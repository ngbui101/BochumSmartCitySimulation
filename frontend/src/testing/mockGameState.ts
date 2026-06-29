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
    { monthIndex: 0, monthOfYear: 0, weatherType: 'windy', confidence: 'high', solarFactor: 0.55, windFactor: 1.25 },
    { monthIndex: 1, monthOfYear: 1, weatherType: 'windy', confidence: 'high', solarFactor: 0.65, windFactor: 1.2 },
    { monthIndex: 2, monthOfYear: 2, weatherType: 'mixed', confidence: 'high', solarFactor: 0.85, windFactor: 1.05 }
  ],
  status: 'running',
  storedEnergy: 0
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
    { monthIndex: 0,  budget: 18000000, kpis: { energyAutarky: 18, citizenSatisfaction: 72, supplySecurity: 58 }, energyDemand: 95, energyProduction: 0, energySaldo: -95, importCost: 5700000, storedEnergy: 0, revenueFromSales: 3800000, operatingCosts: 0, netMonthlyDelta: -1900000 },
    { monthIndex: 1,  budget: 17800000, kpis: { energyAutarky: 19, citizenSatisfaction: 72, supplySecurity: 58 }, energyDemand: 90, energyProduction: 0, energySaldo: -90, importCost: 5400000, storedEnergy: 0, revenueFromSales: 3600000, operatingCosts: 0, netMonthlyDelta: -1800000 },
    { monthIndex: 2,  budget: 17600000, kpis: { energyAutarky: 20, citizenSatisfaction: 72, supplySecurity: 58 }, energyDemand: 80, energyProduction: 10, energySaldo: -70, importCost: 4200000, storedEnergy: 0, revenueFromSales: 3200000, operatingCosts: 0, netMonthlyDelta: -1000000 },
    { monthIndex: 3,  budget: 16400000, kpis: { energyAutarky: 20, citizenSatisfaction: 71, supplySecurity: 58 }, energyDemand: 72, energyProduction: 10, energySaldo: -62, importCost: 3720000, storedEnergy: 0, revenueFromSales: 2880000, operatingCosts: 35000, netMonthlyDelta: -875000 },
    { monthIndex: 4,  budget: 16300000, kpis: { energyAutarky: 23, citizenSatisfaction: 70, supplySecurity: 59 }, energyDemand: 65, energyProduction: 20, energySaldo: -45, importCost: 2700000, storedEnergy: 0, revenueFromSales: 2600000, operatingCosts: 35000, netMonthlyDelta: -135000 },
    { monthIndex: 5,  budget: 16200000, kpis: { energyAutarky: 23, citizenSatisfaction: 70, supplySecurity: 59 }, energyDemand: 60, energyProduction: 25, energySaldo: -35, importCost: 2100000, storedEnergy: 0, revenueFromSales: 2400000, operatingCosts: 35000, netMonthlyDelta: 265000 },
    { monthIndex: 6,  budget: 12800000, kpis: { energyAutarky: 23, citizenSatisfaction: 69, supplySecurity: 59 }, energyDemand: 60, energyProduction: 30, energySaldo: -30, importCost: 1800000, storedEnergy: 0, revenueFromSales: 2400000, operatingCosts: 35000, netMonthlyDelta: 565000 },
    { monthIndex: 7,  budget: 12700000, kpis: { energyAutarky: 27, citizenSatisfaction: 68, supplySecurity: 60 }, energyDemand: 63, energyProduction: 35, energySaldo: -28, importCost: 1680000, storedEnergy: 0, revenueFromSales: 2520000, operatingCosts: 70000, netMonthlyDelta: 770000 },
    { monthIndex: 8,  budget: 12900000, kpis: { energyAutarky: 28, citizenSatisfaction: 69, supplySecurity: 60 }, energyDemand: 70, energyProduction: 38, energySaldo: -32, importCost: 1920000, storedEnergy: 0, revenueFromSales: 2800000, operatingCosts: 70000, netMonthlyDelta: 810000 },
    { monthIndex: 9,  budget: 13100000, kpis: { energyAutarky: 29, citizenSatisfaction: 70, supplySecurity: 60 }, energyDemand: 78, energyProduction: 40, energySaldo: -38, importCost: 2280000, storedEnergy: 0, revenueFromSales: 3120000, operatingCosts: 70000, netMonthlyDelta: 770000 },
    { monthIndex: 10, budget: 13300000, kpis: { energyAutarky: 29, citizenSatisfaction: 71, supplySecurity: 60 }, energyDemand: 88, energyProduction: 42, energySaldo: -46, importCost: 2760000, storedEnergy: 0, revenueFromSales: 3520000, operatingCosts: 105000, netMonthlyDelta: 655000 },
    { monthIndex: 11, budget: 13500000, kpis: { energyAutarky: 29, citizenSatisfaction: 72, supplySecurity: 60 }, energyDemand: 100, energyProduction: 44, energySaldo: -56, importCost: 3360000, storedEnergy: 0, revenueFromSales: 4000000, operatingCosts: 105000, netMonthlyDelta: 535000 },
    { monthIndex: 12, budget: 13800000, kpis: { energyAutarky: 29, citizenSatisfaction: 72, supplySecurity: 60 }, energyDemand: 95, energyProduction: 44, energySaldo: -51, importCost: 3060000, storedEnergy: 0, revenueFromSales: 3800000, operatingCosts: 105000, netMonthlyDelta: 635000 }
  ],
  forecast: [
    { monthIndex: 13, monthOfYear: 1, weatherType: 'windy', confidence: 'high', solarFactor: 0.65, windFactor: 1.2 },
    { monthIndex: 14, monthOfYear: 2, weatherType: 'mixed', confidence: 'high', solarFactor: 0.85, windFactor: 1.05 },
    { monthIndex: 15, monthOfYear: 3, weatherType: 'mixed', confidence: 'high', solarFactor: 1.0, windFactor: 0.95 }
  ],
  status: 'running',
  storedEnergy: 0
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
    { monthIndex: 59, monthOfYear: 11, weatherType: 'stormy', confidence: 'high', solarFactor: 0.5, windFactor: 1.35 },
    { monthIndex: 60, monthOfYear: 0, weatherType: 'windy', confidence: 'medium', solarFactor: 0.55, windFactor: 1.25 },
    { monthIndex: 61, monthOfYear: 1, weatherType: 'windy', confidence: 'low', solarFactor: 0.65, windFactor: 1.2 }
  ],
  status: 'finished',
  storedEnergy: 5,
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
