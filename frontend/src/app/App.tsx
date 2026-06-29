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
import { AssetIconImage } from '../ui/gameAssetIcons';
import type { ItemType, LatLngPosition } from '../types/assets';
import type { GameAction, GameKpis, GameState } from '../types/game';
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
    return `Gute Wahl! ${itemLabel} ist hier moeglich. Noch ${result.remaining} Plaetze frei.`;
  }

  if (result.capacity === 0) {
    return `${itemLabel} ist hier nicht moeglich. Diese Zone hat dafuer keine Kapazitaet.`;
  }

  if (result.remaining <= 0) {
    return `Hier ist kein Platz mehr fuer ${itemLabel}.`;
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
  const { state: realState, dispatch: realDispatch, resetGame } = useAppState();
  const [devStateMode, setDevStateMode] = useState<DevStateMode>('real');
  const [mockState, setMockState] = useState<GameState>(initialMockState);
  const [placementDrag, setPlacementDrag] = useState<PlacementDragState | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
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
    setSelectedItemType(itemType); // Show description popover instantly on click/press down
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

  const selectedItem: any = null;

  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <Sidebar
        budget={state.budget}
        currentMonthIndex={state.currentMonthIndex}
        kpis={state.kpis}
        deltas={deltas}
        forecast={state.forecast}
        selectedItemType={selectedItemType}
        onSelectItemType={setSelectedItemType}
        onPointerDragStart={handlePointerDragStart}
      />

      <section className="map-stage" aria-label="Bochum-Karte">
        <BochumMap
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
        />

        {selectedItem && (
          <div
            className="buyable-item-details-card"
            data-testid="buyable-item-details-card"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd8d0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)',
              fontSize: '0.85rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f3f4f6',
                paddingBottom: '6px',
                marginBottom: '4px',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
                data-testid="selected-item-label"
              >
                {selectedItem.itemType === 'solar'
                  ? 'Solaranlage'
                  : selectedItem.itemType === 'wind'
                  ? 'Windmühle'
                  : 'Energiespeicher'}
              </h4>
              <button
                onClick={() => setSelectedItemType(null)}
                aria-label="Details schließen"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ color: '#4b5563', fontWeight: 500 }}>Kaufpreis:</span>
              <span
                style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}
                data-testid="selected-item-cost"
              >
                {selectedItem.cost.toLocaleString('de-DE')} €
              </span>
            </div>

            <p
              style={{
                margin: '4px 0',
                color: '#4b5563',
                fontSize: '0.8rem',
                lineHeight: '1.3',
              }}
              data-testid="selected-item-description"
            >
              {selectedItem.description}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                fontSize: '0.75rem',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '8px',
                marginTop: '4px',
              }}
            >
              {selectedItem.productionValue > 0 && (
                <div>
                  <span style={{ color: '#6b7280' }}>Erzeugung: </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {selectedItem.productionValue} MW
                  </span>
                </div>
              )}
              {selectedItem.storageValue > 0 && (
                <div>
                  <span style={{ color: '#6b7280' }}>Speicher: </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {selectedItem.storageValue} MWh
                  </span>
                </div>
              )}
              <div>
                <span style={{ color: '#6b7280' }}>Betrieb: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {selectedItem.operatingCost.toLocaleString('de-DE')} €/M.
                </span>
              </div>
            </div>
          </div>
        )}
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
