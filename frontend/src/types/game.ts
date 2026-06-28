import type { ExistingAsset, PlayerAsset } from './assets';
import type { ItemType, LatLngPosition } from './assets';
import type { ZoneId } from './zones';
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
  | {
      type: 'PLACE_ASSET';
      itemType: ItemType;
      zoneId: ZoneId;
      position: LatLngPosition;
    }
  | { type: 'SELL_ASSET'; assetId: string }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'SELECT_ASSET'; assetId: string }
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
  selectedAssetId?: string;
  finalScore?: FinalScore;
};
