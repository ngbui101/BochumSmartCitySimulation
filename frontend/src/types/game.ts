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
  | { type: 'RESET_GAME' }
  | { type: 'SELECT_ASSET'; assetId: string }
  | { type: 'CLEAR_SELECTION' };

export type UndoEntry =
  | {
      type: 'placed_asset';
      description: string;
      asset: PlayerAsset;
    }
  | {
      type: 'sold_asset';
      description: string;
      asset: PlayerAsset;
      refundAmount: number;
    };

export type MonthlySnapshot = {
  monthIndex: number;
  budget: number;
  kpis: GameKpis;
  energyDemand: number;
  energyProduction: number;
  energySaldo: number;
  importCost: number;
  storedEnergy: number;
  revenueFromSales: number;
  operatingCosts: number;
  netMonthlyDelta: number;
};

export type GameState = {
  gameId: string;
  currentMonthIndex: number;
  budget: number;
  kpis: GameKpis;
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  undoStack: UndoEntry[];
  monthlyHistory: MonthlySnapshot[];
  forecast: WeatherForecastMonth[];
  status: GameStatus;
  /** Persistenter Energiepuffer aller Speicher-Assets in Einheiten. */
  storedEnergy: number;
  selectedAssetId?: string;
  finalScore?: FinalScore;
};
