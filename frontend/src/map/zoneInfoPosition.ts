import type { LeafletMouseEvent } from 'leaflet';
import type { ZoneId } from '../types/zones';

type ZoneInfoPlacement = 'top' | 'right' | 'bottom' | 'left';

export type ZoneInfoSelection = {
  zoneId: ZoneId;
  anchor: {
    x: number;
    y: number;
  };
};

const zoneInfoCardWidth = 320;
const zoneInfoCardHeight = 360;
const zoneInfoCardOffset = 16;
const fallbackMapSize = {
  width: 1000,
  height: 1000
};

const clamp = (value: number, min: number, max: number): number => {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

export const getZoneClickAnchor = (event: Partial<Pick<LeafletMouseEvent, 'containerPoint' | 'layerPoint'>>): ZoneInfoSelection['anchor'] => {
  const point = event.containerPoint ?? event.layerPoint;

  if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
    return {
      x: point.x,
      y: point.y
    };
  }

  return {
    x: fallbackMapSize.width / 2,
    y: fallbackMapSize.height / 2
  };
};

export const getMapRenderSize = (element: HTMLDivElement | null) => {
  const rect = element?.getBoundingClientRect();

  return {
    width: rect?.width || fallbackMapSize.width,
    height: rect?.height || fallbackMapSize.height
  };
};

export const getZoneInfoPosition = (
  anchor: ZoneInfoSelection['anchor'],
  mapSize: { width: number; height: number }
): { placement: ZoneInfoPlacement; left: number; top: number } => {
  const horizontalEdgeThreshold = mapSize.width / 3;
  const verticalEdgeThreshold = mapSize.height / 2;
  const maxLeft = mapSize.width - zoneInfoCardWidth - zoneInfoCardOffset;
  const maxTop = mapSize.height - zoneInfoCardHeight - zoneInfoCardOffset;

  if (anchor.x < horizontalEdgeThreshold) {
    return {
      placement: 'right',
      left: clamp(anchor.x + zoneInfoCardOffset, zoneInfoCardOffset, maxLeft),
      top: clamp(anchor.y - zoneInfoCardHeight / 2, zoneInfoCardOffset, maxTop)
    };
  }

  if (anchor.x > mapSize.width - horizontalEdgeThreshold) {
    return {
      placement: 'left',
      left: clamp(anchor.x - zoneInfoCardWidth - zoneInfoCardOffset, zoneInfoCardOffset, maxLeft),
      top: clamp(anchor.y - zoneInfoCardHeight / 2, zoneInfoCardOffset, maxTop)
    };
  }

  if (anchor.y > verticalEdgeThreshold) {
    return {
      placement: 'top',
      left: clamp(anchor.x - zoneInfoCardWidth / 2, zoneInfoCardOffset, maxLeft),
      top: clamp(anchor.y - zoneInfoCardHeight - zoneInfoCardOffset, zoneInfoCardOffset, maxTop)
    };
  }

  return {
    placement: 'bottom',
    left: clamp(anchor.x - zoneInfoCardWidth / 2, zoneInfoCardOffset, maxLeft),
    top: clamp(anchor.y + zoneInfoCardOffset, zoneInfoCardOffset, maxTop)
  };
};
