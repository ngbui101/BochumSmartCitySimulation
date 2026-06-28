import type { ExistingAsset, PlayerAsset } from './assets';
import type { WeatherForecastMonth } from './weather';

export type GameStatus = 'running' | 'finished';

export type GameKpis = {
  energyAutarky: number;
  citizenSatisfaction: number;
  supplySecurity: number;
};

export type ScoreBreakdown = {
  energyAutarky: number;
  budgetEfficiency: number;
  citizenSatisfaction: number;
  supplySecurity: number;
};

export type FinalScore = {
  totalScore: number;
  breakdown: ScoreBreakdown;
  qualitativeSummary: string;
};

export type GameAction =
  | { type: 'PLACE_ASSET' }
  | { type: 'SELL_ASSET' }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'SELECT_ASSET' }
  | { type: 'CLEAR_SELECTION' };

export type MonthlySnapshot = {
  monthIndex: number;
  budget: number;
  kpis: GameKpis;
};

export type GameState = {
  gameId: string;
  currentMonthIndex: number;
  budget: number;
  kpis: GameKpis;
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  undoStack: GameAction[];
  monthlyHistory: MonthlySnapshot[];
  forecast: WeatherForecastMonth[];
  status: GameStatus;
  finalScore?: FinalScore;
};
