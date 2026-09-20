import { itemDefinitions } from '../data/itemDefinitions';
import { createInitialGameState } from './initialGameState';
import { getPlayerAssetSellValue } from './selectors';
import { clampSubsidyLevel } from '../data/subsidyPrograms';
import { canPlaceItem } from '../simulation/placementRules';
import { advanceMonth } from '../simulation/monthlySimulation';
import { createRandomWeatherSeed } from '../simulation/weatherSimulation';
import { applyLossState } from './lossRules';
import type { PlayerAsset } from '../types/assets';
import type { GameAction, GameState } from '../types/game';

function getItemDefinition(itemType: PlayerAsset['itemType']) {
  return itemDefinitions.find((item) => item.itemType === itemType);
}

function getItemLabel(itemType: PlayerAsset['itemType']): string {
  return getItemDefinition(itemType)?.label ?? itemType;
}

function createPlayerAsset(
  state: GameState,
  action: Extract<GameAction, { type: 'PLACE_ASSET' }>
): PlayerAsset | null {
  const itemDefinition = getItemDefinition(action.itemType);

  if (!itemDefinition) {
    return null;
  }

  return {
    id: `player-${state.currentMonthIndex}-${state.playerAssets.length + 1}-${Date.now().toString(36)}`,
    itemType: action.itemType,
    zoneId: action.zoneId,
    position: action.position,
    status: 'under_construction',
    placedMonthIndex: state.currentMonthIndex,
    activeFromMonthIndex: state.currentMonthIndex + itemDefinition.buildTimeMonths,
    purchasePrice: itemDefinition.cost
  };
}

function getSubsidies(state: GameState): NonNullable<GameState['subsidies']> {
  return state.subsidies ?? {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_ASSET': {
      const placementResult = canPlaceItem(state, action.itemType, action.zoneId);
      const itemDefinition = getItemDefinition(action.itemType);

      if (!placementResult.allowed || !itemDefinition) {
        return state;
      }

      const playerAsset = createPlayerAsset(state, action);

      if (!playerAsset) {
        return state;
      }

      return applyLossState({
        ...state,
        budget: state.budget - itemDefinition.cost,
        playerAssets: [...state.playerAssets, playerAsset],
        undoStack: [
          ...state.undoStack,
          {
            type: 'placed_asset',
            description: `${getItemLabel(playerAsset.itemType)} platzieren rückgängig machen.`,
            asset: playerAsset
          }
        ],
        selectedAssetId: playerAsset.id
      });
    }

    case 'SELL_ASSET': {
      const assetToSell = state.playerAssets.find((asset) => asset.id === action.assetId);

      if (!assetToSell) {
        return state;
      }

      const refundAmount = getPlayerAssetSellValue(assetToSell);

      return {
        ...state,
        budget: state.budget + refundAmount,
        playerAssets: state.playerAssets.filter((asset) => asset.id !== action.assetId),
        undoStack: [
          ...state.undoStack,
          {
            type: 'sold_asset',
            description: `${getItemLabel(assetToSell.itemType)} verkaufen rückgängig machen.`,
            asset: assetToSell,
            refundAmount
          }
        ],
        selectedAssetId:
          state.selectedAssetId === action.assetId ? undefined : state.selectedAssetId
      };
    }

    case 'SELECT_ASSET':
      return {
        ...state,
        selectedAssetId: action.assetId
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedAssetId: undefined
      };

    case 'SET_SUBSIDY_LEVEL':
      {
        const subsidies = getSubsidies(state);

        return {
          ...state,
          subsidies: {
            ...subsidies,
            [action.program]: {
              ...subsidies[action.program],
              level: clampSubsidyLevel(action.level)
            }
          }
        };
      }

    case 'UNDO_LAST_ACTION': {
      const latestUndoEntry = state.undoStack[state.undoStack.length - 1];
      const remainingUndoStack = state.undoStack.slice(0, -1);

      if (!latestUndoEntry) {
        return state;
      }

      if (latestUndoEntry.type === 'placed_asset') {
        return {
          ...state,
          budget: state.budget + latestUndoEntry.asset.purchasePrice,
          playerAssets: state.playerAssets.filter((asset) => asset.id !== latestUndoEntry.asset.id),
          undoStack: remainingUndoStack,
          selectedAssetId:
            state.selectedAssetId === latestUndoEntry.asset.id ? undefined : state.selectedAssetId
        };
      }

      return {
        ...state,
        budget: state.budget - latestUndoEntry.refundAmount,
        playerAssets: [...state.playerAssets, latestUndoEntry.asset],
        undoStack: remainingUndoStack,
        selectedAssetId: latestUndoEntry.asset.id
      };
    }

    case 'ADVANCE_MONTH':
      return advanceMonth(state);

    case 'RESET_GAME':
      return createInitialGameState(createRandomWeatherSeed());

    default:
      return state;
  }
}
