import type { ExistingAsset, PlayerAsset, PrivateAsset } from './assets';
import type { ItemType, LatLngPosition } from './assets';
import type { ZoneId } from './zones';
import type { WeatherForecastMonth } from './weather';

export type GameStatus = 'running' | 'finished' | 'lost';

export type LossReason = 'bankrupt' | 'voted_out';

export type SubsidyProgram = 'solar' | 'storage';

export type SubsidyLevel = 0 | 1 | 2 | 3;

export type SubsidyProgramState = {
  level: SubsidyLevel;
  privateCapacity: number;
  /** Cumulative public subsidy spend that counts toward the next private asset. */
  spendAccumulator?: number;
};

export type SubsidyState = Record<SubsidyProgram, SubsidyProgramState>;

export type GameKpis = {
  energyAutarky: number;
  citizenSatisfaction: number;
  supplySecurity: number;
};

export type ScoreBreakdown = {
  budgetPoints: number;
  energyAutarkyPoints: number;
  citizenSatisfactionPoints: number;
  supplySecurityPoints: number;
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
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SUBSIDY_LEVEL'; program: SubsidyProgram; level: SubsidyLevel };

export type UndoEntry =
  | {
      type: 'placed_asset';
      description: string;
      asset: PlayerAsset;
      citizenSatisfactionPenalty: number;
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
  subsidyCosts?: number;
  privateSolarProduction?: number;
  privateStorageDischarge?: number;
  netMonthlyDelta: number;
};

export type GameState = {
  gameId: string;
  /** Seed für die pro Spiel zufällige, reproduzierbare Wetterfolge. */
  weatherSeed?: number;
  currentMonthIndex: number;
  budget: number;
  kpis: GameKpis;
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  privateAssets?: PrivateAsset[];
  undoStack: UndoEntry[];
  monthlyHistory: MonthlySnapshot[];
  subsidies?: SubsidyState;
  forecast: WeatherForecastMonth[];
  status: GameStatus;
  lossReason?: LossReason;
  /** Persistenter Energiepuffer aller Speicher-Assets in Einheiten. */
  storedEnergy: number;
  selectedAssetId?: string;
  finalScore?: FinalScore;
};
