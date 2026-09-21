import { useEffect, useMemo, useState } from 'react';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { itemDefinitions } from '../data/itemDefinitions';
import { canPlaceItem } from '../simulation/placementRules';
import { findZoneForPoint } from '../simulation/zoneDetection';
import type { ItemType, LatLngPosition } from '../types/assets';
import type { GameState } from '../types/game';
import type { ZoneId } from '../types/zones';
import type { PlacementFeedback, ZoneFeedback } from '../map/placementTypes';
import type { AppDispatch } from './appState';

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

export function getItemLabel(itemType: ItemType): string {
  return itemDefinitions.find((item) => item.itemType === itemType)?.label ?? itemType;
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

/** Transient placement interaction; only the reducer commits game changes. */
export function usePlacement(state: GameState, dispatch: AppDispatch) {
  const [placementDrag, setPlacementDrag] = useState<PlacementDragState | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
  const [zoneFeedback, setZoneFeedback] = useState<ZoneFeedback | undefined>(undefined);
  const [placementFeedback, setPlacementFeedback] = useState<PlacementFeedback | undefined>(
    undefined
  );
  const clearPlacementFeedback = () => {
    setZoneFeedback(undefined);
    setPlacementFeedback(undefined);
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

    dispatch({
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


  const cancelDrag = () => setPlacementDrag(null);
  const resetPlacement = () => {
    clearPlacementFeedback();
    cancelDrag();
    setSelectedItemType(null);
  };

  return {
    placementDrag, selectedItemType, setSelectedItemType, zoneFeedback,
    placementFeedback, placeableZones, clearPlacementFeedback, cancelDrag,
    resetPlacement, handlePointerDragStart, handleDragPosition, handleDropAsset,
    handleDropOutside, handleDragLeave
  };
}
