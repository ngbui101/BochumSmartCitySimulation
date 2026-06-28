import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { BochumMap } from '../map/BochumMap';
import { BottomControls } from '../components/BottomControls';
import { EndScreen } from '../sidebar/EndScreen';
import { initialMockState, midgameMockState, finishMockState } from '../testing/mockGameState';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { itemDefinitions } from '../data/itemDefinitions';
import { gameReducer } from '../game/reducer';
import { getUndoTooltip } from '../game/selectors';
import { canPlaceItem } from '../simulation/placementRules';
import { calculateFinalScore } from '../simulation/scoring';
import { findZoneForPoint } from '../simulation/zoneDetection';
import { useAppState } from './appState';
import { SolarIcon, StorageIcon, WindIcon } from '../ui/icons';
import type { ItemType, LatLngPosition } from '../types/assets';
import type { GameAction, GameKpis, GameState } from '../types/game';
import type { ZoneId } from '../types/zones';
import type { PlacementFeedback, ZoneFeedback } from '../map/BochumMap';

type DevStateMode = 'real' | 'initial' | 'midgame' | 'finished';

type PlacementDragState = {
  itemType: ItemType;
  clientX: number;
  clientY: number;
  currentLatLng?: LatLngPosition;
  currentZoneId?: ZoneId | null;
  placementResult?: ReturnType<typeof canPlaceItem>;
};

const mockStates: Record<Exclude<DevStateMode, 'real'>, GameState> = {
  initial: initialMockState,
  midgame: midgameMockState,
  finished: finishMockState
};

function isMockStateMode(value: DevStateMode): value is Exclude<DevStateMode, 'real'> {
  return value !== 'real';
}

function getKpiDeltas(state: GameState):
  | {
      energyAutarky?: number;
      citizenSatisfaction?: number;
      supplySecurity?: number;
    }
  | undefined {
  const previousMonth = state.monthlyHistory[state.monthlyHistory.length - 1];

  if (!previousMonth) {
    return undefined;
  }

  return {
    energyAutarky: state.kpis.energyAutarky - previousMonth.kpis.energyAutarky,
    citizenSatisfaction: state.kpis.citizenSatisfaction - previousMonth.kpis.citizenSatisfaction,
    supplySecurity: state.kpis.supplySecurity - previousMonth.kpis.supplySecurity
  };
}

function getItemLabel(itemType: ItemType): string {
  return itemDefinitions.find((item) => item.itemType === itemType)?.label ?? itemType;
}

function getItemIcon(itemType: ItemType): React.ReactNode {
  if (itemType === 'solar') {
    return <SolarIcon size={22} />;
  }

  if (itemType === 'wind') {
    return <WindIcon size={22} />;
  }

  return <StorageIcon size={22} />;
}

function getPlacementMessage(itemType: ItemType, result: ReturnType<typeof canPlaceItem>): string {
  return `${getItemLabel(itemType)}: ${result.reason} Restkapazitaet: ${result.remaining}/${result.capacity}.`;
}

function validateDropPosition(
  state: GameState,
  itemType: ItemType,
  position: LatLngPosition
):
  | {
      zoneId: ZoneId;
      zoneFeedback: ZoneFeedback;
      placementFeedback: PlacementFeedback;
    }
  | {
      zoneId: null;
      zoneFeedback: undefined;
      placementFeedback: PlacementFeedback;
    } {
  const zoneId = findZoneForPoint(position, bochumZonesGeoJson);

  if (!zoneId) {
    return {
      zoneId: null,
      zoneFeedback: undefined,
      placementFeedback: {
        status: 'blocked',
        message: 'Keine Bochumer Zone an dieser Position.'
      }
    };
  }

  const placementResult = canPlaceItem(state, itemType, zoneId);
  const status = placementResult.allowed ? 'allowed' : 'blocked';
  const message = getPlacementMessage(itemType, placementResult);

  return {
    zoneId,
    zoneFeedback: {
      zoneId,
      status,
      message
    },
    placementFeedback: {
      status,
      message
    }
  };
}

export function App() {
  const { state: realState, dispatch: realDispatch, resetGame } = useAppState();
  const [devStateMode, setDevStateMode] = useState<DevStateMode>('real');
  const [mockState, setMockState] = useState<GameState>(initialMockState);
  const [placementDrag, setPlacementDrag] = useState<PlacementDragState | null>(null);
  const [zoneFeedback, setZoneFeedback] = useState<ZoneFeedback | undefined>(undefined);
  const [placementFeedback, setPlacementFeedback] = useState<PlacementFeedback | undefined>(
    undefined
  );

  const isRealStateMode = devStateMode === 'real';
  const state = isRealStateMode ? realState : mockState;

  const handleMockStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as DevStateMode;

    setDevStateMode(value);
    setZoneFeedback(undefined);
    setPlacementFeedback(undefined);
    setPlacementDrag(null);

    if (isMockStateMode(value)) {
      setMockState(mockStates[value]);
    }
  };

  const dispatchToActiveState = (action: GameAction) => {
    if (isRealStateMode) {
      realDispatch(action);
      return;
    }

    setMockState((currentState) => gameReducer(currentState, action));
  };

  const clearPlacementFeedback = () => {
    setZoneFeedback(undefined);
    setPlacementFeedback(undefined);
  };

  const handleSelectAsset = (id: string | undefined) => {
    dispatchToActiveState(id ? { type: 'SELECT_ASSET', assetId: id } : { type: 'CLEAR_SELECTION' });
  };

  const handleSellAsset = (id: string) => {
    clearPlacementFeedback();
    dispatchToActiveState({ type: 'SELL_ASSET', assetId: id });
  };

  const handleUndo = () => {
    clearPlacementFeedback();
    dispatchToActiveState({ type: 'UNDO_LAST_ACTION' });
  };

  const handleNextMonth = () => {
    clearPlacementFeedback();
    setPlacementDrag(null);
    dispatchToActiveState({ type: 'ADVANCE_MONTH' });
  };

  const handlePointerDragStart = (
    itemType: ItemType,
    pointer: {
      clientX: number;
      clientY: number;
    }
  ) => {
    setPlacementDrag({
      itemType,
      clientX: pointer.clientX,
      clientY: pointer.clientY
    });
    clearPlacementFeedback();
  };

  const handleDragPosition = (position: LatLngPosition) => {
    if (!placementDrag) {
      return;
    }

    const validation = validateDropPosition(state, placementDrag.itemType, position);
    setZoneFeedback(validation.zoneFeedback);
    setPlacementFeedback(validation.placementFeedback);
    setPlacementDrag((currentDrag) =>
      currentDrag
        ? {
            ...currentDrag,
            currentLatLng: position,
            currentZoneId: validation.zoneId,
            placementResult:
              validation.zoneId === null
                ? undefined
                : canPlaceItem(state, currentDrag.itemType, validation.zoneId)
          }
        : null
    );
  };

  const handleDropAsset = (position: LatLngPosition) => {
    if (!placementDrag) {
      return;
    }

    const itemType = placementDrag.itemType;
    const validation = validateDropPosition(state, itemType, position);
    setZoneFeedback(validation.zoneFeedback);
    setPlacementFeedback(validation.placementFeedback);
    setPlacementDrag(null);

    if (!validation.zoneId || validation.placementFeedback.status === 'blocked') {
      return;
    }

    dispatchToActiveState({
      type: 'PLACE_ASSET',
      itemType,
      zoneId: validation.zoneId,
      position
    });
  };

  const handleRestart = () => {
    clearPlacementFeedback();
    setPlacementDrag(null);

    if (isRealStateMode) {
      resetGame();
      return;
    }

    setDevStateMode('initial');
    setMockState(initialMockState);
  };

  const handleDragLeave = () => {
    setZoneFeedback(undefined);

    if (placementDrag) {
      setPlacementFeedback({
        status: 'blocked',
        message: 'Keine Bochumer Zone an dieser Position.'
      });
      setPlacementDrag((currentDrag) =>
        currentDrag
          ? {
              ...currentDrag,
              currentLatLng: undefined,
              currentZoneId: null,
              placementResult: undefined
            }
          : null
      );
    }
  };

  useEffect(() => {
    if (!placementDrag) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setPlacementDrag((currentDrag) =>
        currentDrag
          ? {
              ...currentDrag,
              clientX: event.clientX,
              clientY: event.clientY
            }
          : null
      );
    };

    const handlePointerUp = () => {
      setPlacementDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [placementDrag]);

  const selectedAsset = useMemo(
    () =>
      state.playerAssets.find((asset) => asset.id === state.selectedAssetId) ||
      state.existingAssets.find((asset) => asset.id === state.selectedAssetId),
    [state.existingAssets, state.playerAssets, state.selectedAssetId]
  );

  const canUndo = state.undoStack.length > 0;
  const undoTooltip = getUndoTooltip(state);
  const deltas: Partial<GameKpis> | undefined = getKpiDeltas(state);
  const finalScore =
    state.status === 'finished' ? state.finalScore ?? calculateFinalScore(state) : undefined;

  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <Sidebar
        budget={state.budget}
        currentMonthIndex={state.currentMonthIndex}
        kpis={state.kpis}
        deltas={deltas}
        forecast={state.forecast}
        selectedAsset={selectedAsset}
        onSellAsset={handleSellAsset}
        onPointerDragStart={handlePointerDragStart}
      />

      <section className="map-stage" aria-label="Bochum-Karte">
        <BochumMap
          playerAssets={state.playerAssets}
          existingAssets={state.existingAssets}
          selectedAssetId={state.selectedAssetId}
          onSelectAsset={handleSelectAsset}
          zoneFeedback={zoneFeedback}
          placementFeedback={placementFeedback}
          placementDrag={placementDrag}
          onDragPosition={handleDragPosition}
          onDropAsset={handleDropAsset}
          onDragLeave={handleDragLeave}
        />
        <BottomControls
          canUndo={canUndo}
          undoTooltip={undoTooltip}
          onUndo={handleUndo}
          onNextMonth={handleNextMonth}
        />
      </section>

      {import.meta.env.DEV && (
        <div className="dev-mock-harness" data-testid="dev-mock-harness">
          <label htmlFor="mock-state-select">State-Modus:</label>
          <select id="mock-state-select" onChange={handleMockStateChange} value={devStateMode}>
            <option value="real">Real-State</option>
            <option value="initial">Mock Preview: Initial</option>
            <option value="midgame">Mock Preview: Midgame</option>
            <option value="finished">Mock Preview: Finished</option>
          </select>
        </div>
      )}

      {placementDrag && (
        <div
          className="placement-drag-preview"
          data-testid="placement-drag-preview"
          style={{
            transform: `translate(${placementDrag.clientX + 12}px, ${
              placementDrag.clientY + 12
            }px)`
          }}
        >
          <span className="placement-drag-preview-icon">{getItemIcon(placementDrag.itemType)}</span>
          <span>{getItemLabel(placementDrag.itemType)}</span>
        </div>
      )}

      {finalScore && <EndScreen finalScore={finalScore} onRestart={handleRestart} />}
    </main>
  );
}
