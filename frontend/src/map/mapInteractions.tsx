import React, { useEffect, useLayoutEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { ItemType, LatLngPosition } from '../types/assets';

/** Marks a zone click so the map background handler does not clear its card. */
export type ZoneClickEvent = MouseEvent & { __bochumZoneClickHandled?: boolean };

interface MapEventsHandlerProps {
  onSelectAsset: (id: string | undefined) => void;
  onClearZoneInfo: () => void;
}

export const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onSelectAsset,
  onClearZoneInfo
}) => {
  useMapEvents({
    click: (e) => {
      const originalEvent = e.originalEvent as ZoneClickEvent;
      if (originalEvent?.__bochumZoneClickHandled) {
        originalEvent.__bochumZoneClickHandled = false;
        return;
      }

      onClearZoneInfo();
      onSelectAsset(undefined);
    }
  });
  return null;
};

interface DragDropHandlerProps {
  placementDrag?: {
    itemType: ItemType;
    clientX: number;
    clientY: number;
  } | null;
  onDragPosition?: (position: LatLngPosition) => void;
  onDropAsset?: (position: LatLngPosition) => void;
  onDropOutside?: () => void;
  onDragLeave?: () => void;
}

export const PointerPlacementHandler: React.FC<DragDropHandlerProps> = ({
  placementDrag,
  onDragPosition,
  onDropAsset,
  onDropOutside,
  onDragLeave
}) => {
  const map = useMap();

  useEffect(() => {
    if (!placementDrag) {
      return undefined;
    }

    const container = map.getContainer();

    const isPointerInsideMap = (event: PointerEvent): boolean => {
      const rect = container.getBoundingClientRect();

      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    };

    const eventToLatLng = (event: PointerEvent): LatLngPosition => {
      const rect = container.getBoundingClientRect();
      const point = L.point(event.clientX - rect.left, event.clientY - rect.top);
      const latLng = map.containerPointToLatLng(point);

      return {
        lat: latLng.lat,
        lng: latLng.lng
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerInsideMap(event)) {
        onDragLeave?.();
        return;
      }

      onDragPosition?.(eventToLatLng(event));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isPointerInsideMap(event)) {
        onDropOutside?.();
        return;
      }

      onDropAsset?.(eventToLatLng(event));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [placementDrag, map, onDragLeave, onDragPosition, onDropAsset, onDropOutside]);

  return null;
};

export const ZoneLabelPane: React.FC = () => {
  const map = useMap();

  useLayoutEffect(() => {
    const pane = map.getPane('zone-labels') ?? map.createPane('zone-labels');
    pane.style.zIndex = '350';
    pane.style.pointerEvents = 'none';
  }, [map]);

  return null;
};
