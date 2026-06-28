import { itemDefinitions } from '../data/itemDefinitions';
import { canPlaceItem } from '../simulation/placementRules';
import type { PlayerAsset } from '../types/assets';
import type { GameAction, GameState } from '../types/game';

const SELL_REFUND_RATE = 0.6;

function getItemDefinition(itemType: PlayerAsset['itemType']) {
  return itemDefinitions.find((item) => item.itemType === itemType);
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

      return {
        ...state,
        budget: state.budget - itemDefinition.cost,
        playerAssets: [...state.playerAssets, playerAsset],
        selectedAssetId: playerAsset.id
      };
    }

    case 'SELL_ASSET': {
      const assetToSell = state.playerAssets.find((asset) => asset.id === action.assetId);

      if (!assetToSell) {
        return state;
      }

      return {
        ...state,
        budget: state.budget + Math.round(assetToSell.purchasePrice * SELL_REFUND_RATE),
        playerAssets: state.playerAssets.filter((asset) => asset.id !== action.assetId),
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

    case 'UNDO_LAST_ACTION':
    case 'ADVANCE_MONTH':
      return state;

    default:
      return state;
  }
}
