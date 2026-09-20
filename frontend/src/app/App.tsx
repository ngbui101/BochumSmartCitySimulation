import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { BochumMap } from '../map/BochumMap';
import { BottomControls } from '../components/BottomControls';
import { EndScreen } from '../sidebar/EndScreen';
import { initialMockState, midgameMockState, finishMockState } from '../testing/mockGameState';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { itemDefinitions } from '../data/itemDefinitions';
import { gameReducer } from '../game/reducer';
import { getUndoTooltip, getCurrentEnergySaldo, getStorageCapacity, getCurrentImportCost, getCurrentNetMonthlyDelta, getCurrentRevenueFromSales, getCurrentSubsidyCosts, getCurrentPrivateSolarProduction, getCurrentPrivateStorageDischarge } from '../game/selectors';
import { canPlaceItem } from '../simulation/placementRules';
import { calculateFinalScore } from '../simulation/scoring';
import { findZoneForPoint } from '../simulation/zoneDetection';
import { useAppState } from './appState';
import { AssetIconImage } from '../ui/gameAssetIcons';
import type { ItemType, LatLngPosition } from '../types/assets';
import type { GameAction, GameKpis, GameState, SubsidyLevel, SubsidyProgram } from '../types/game';
import type { ZoneId } from '../types/zones';
import type { PlacementFeedback, ZoneFeedback } from '../map/BochumMap';

type DevStateMode = 'real' | 'initial' | 'midgame' | 'finished';

type PlacementDragState = {
  itemType: ItemType;
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
  startTime: number;
  hasMoved: boolean;
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
  return <AssetIconImage itemType={itemType} size={64} />;
}

function getPlacementMessage(itemType: ItemType, result: ReturnType<typeof canPlaceItem>): string {
  const itemLabel = getItemLabel(itemType);

  if (result.allowed) {
    return `Gute Wahl! ${itemLabel} ist hier möglich. Noch ${result.remaining} Plätze frei.`;
  }

  if (result.capacity === 0) {
    return `${itemLabel} ist hier nicht möglich. Diese Zone hat dafür keine Kapazität.`;
  }

  if (result.remaining <= 0) {
    return `Hier ist kein Platz mehr für ${itemLabel}.`;
  }

  return `${itemLabel} kann hier gerade nicht gebaut werden. ${result.reason}`;
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
        message: 'Hier liegt keine Bochum-Spielzone.'
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
  const {
    state: realState,
    dispatch: realDispatch,
    resetGame,
    storageStatus
  } = useAppState();
  const [devStateMode, setDevStateMode] = useState<DevStateMode>('real');
  const [mockState, setMockState] = useState<GameState>(initialMockState);
  const [placementDrag, setPlacementDrag] = useState<PlacementDragState | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
  const [zoneFeedback, setZoneFeedback] = useState<ZoneFeedback | undefined>(undefined);
  const [placementFeedback, setPlacementFeedback] = useState<PlacementFeedback | undefined>(
    undefined
  );
  const [resetVersion, setResetVersion] = useState(0);

  const isRealStateMode = devStateMode === 'real';
  const state = isRealStateMode ? realState : mockState;

  const handleMockStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as DevStateMode;

    setDevStateMode(value);
    setZoneFeedback(undefined);
    setPlacementFeedback(undefined);
    setPlacementDrag(null);
    setSelectedItemType(null);

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

  const handleSetSubsidyLevel = (program: SubsidyProgram, level: SubsidyLevel) => {
    dispatchToActiveState({ type: 'SET_SUBSIDY_LEVEL', program, level });
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
      clientY: pointer.clientY,
      startX: pointer.clientX,
      startY: pointer.clientY,
      startTime: Date.now(),
      hasMoved: false
    });
    setSelectedItemType(null);
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
    setSelectedItemType(null); // Deselect the item on drop

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

  const handleDropOutside = () => {
    setZoneFeedback(undefined);
    setPlacementFeedback({
      status: 'blocked',
      message: 'Hier liegt keine Bochum-Spielzone.'
    });
    setPlacementDrag(null);
    setSelectedItemType(null);
  };

  const handleRestart = () => {
    clearPlacementFeedback();
    setPlacementDrag(null);
    setSelectedItemType(null);
    setResetVersion((version) => version + 1);

    if (isRealStateMode) {
      resetGame();
      return;
    }

    setDevStateMode('initial');
    setMockState(initialMockState);
  };

  const handleResetRequest = () => {
    if (!window.confirm('Möchtest du das laufende Spiel wirklich zurücksetzen?')) {
      return;
    }

    handleRestart();
  };

  const handleDragLeave = () => {
    setZoneFeedback(undefined);

    if (placementDrag) {
      setPlacementFeedback({
        status: 'blocked',
        message: 'Hier liegt keine Bochum-Spielzone.'
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
      setPlacementDrag((currentDrag) => {
        if (!currentDrag) return null;
        const distance = Math.sqrt(
          (event.clientX - currentDrag.startX) ** 2 +
          (event.clientY - currentDrag.startY) ** 2
        );
        return {
          ...currentDrag,
          clientX: event.clientX,
          clientY: event.clientY,
          hasMoved: currentDrag.hasMoved || distance > 10
        };
      });
    };

    const handlePointerUp = () => {
      setPlacementDrag((currentDrag) => {
        if (currentDrag?.hasMoved) {
          setSelectedItemType(null); // Aborted drag: deselect the option
        }
        return null;
      });
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

  const placeableZones = useMemo(() => {
    const itemType = placementDrag?.itemType ?? selectedItemType;

    if (!itemType) {
      return null;
    }

    const zones: Record<string, boolean> = {};
    for (const feature of bochumZonesGeoJson.features) {
      const zoneId = feature.properties?.zoneId;
      if (zoneId) {
        zones[zoneId] = canPlaceItem(state, itemType, zoneId as ZoneId).allowed;
      }
    }
    return zones;
  }, [placementDrag, selectedItemType, state]);


  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <Sidebar
        budget={state.budget}
        currentMonthIndex={state.currentMonthIndex}
        kpis={state.kpis}
        energyStatus={{
          energySaldo: getCurrentEnergySaldo(state),
          importCost: getCurrentImportCost(state),
          storedEnergy: state.storedEnergy,
          storageCapacity: getStorageCapacity(state),
          isGracePeriod: state.currentMonthIndex === 0,
          netMonthlyDelta: getCurrentNetMonthlyDelta(state),
          revenueFromSales: getCurrentRevenueFromSales(state)
        }}
        deltas={deltas}
        forecast={state.forecast}
        subsidies={state.subsidies}
        subsidyCosts={getCurrentSubsidyCosts(state)}
        privateSolarProduction={getCurrentPrivateSolarProduction(state)}
        privateStorageDischarge={getCurrentPrivateStorageDischarge(state)}
        selectedItemType={selectedItemType}
        onSelectItemType={setSelectedItemType}
        onSetSubsidyLevel={handleSetSubsidyLevel}
        onPointerDragStart={handlePointerDragStart}
      />

      <section className="map-stage" aria-label="Bochum-Karte">
        {storageStatus === 'unavailable' && (
          <div className="storage-warning" role="status" data-testid="storage-warning">
            Der Spielstand kann in diesem Browser nicht gespeichert werden. Das Spiel läuft weiter,
            kann aber beim Aktualisieren der Seite verloren gehen.
          </div>
        )}
        <BochumMap
          key={resetVersion}
          playerAssets={state.playerAssets}
          existingAssets={state.existingAssets}
          selectedAssetId={state.selectedAssetId}
          onSelectAsset={handleSelectAsset}
          onSell={handleSellAsset}
          zoneFeedback={zoneFeedback}
          placementFeedback={placementFeedback}
          placementDrag={placementDrag}
          onDragPosition={handleDragPosition}
          onDropAsset={handleDropAsset}
          onDropOutside={handleDropOutside}
          onDragLeave={handleDragLeave}
          placeableZones={placeableZones}
        />
        <BottomControls
          canUndo={canUndo}
          undoTooltip={undoTooltip}
          onUndo={handleUndo}
          onNextMonth={handleNextMonth}
          onReset={handleResetRequest}
        />
      </section>

      {import.meta.env.DEV && (
        <div className="dev-mock-harness" data-testid="dev-mock-harness">
          <label htmlFor="mock-state-select">Dev State-Modus</label>
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
