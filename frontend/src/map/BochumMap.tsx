import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { bochumBounds, minZoom, maxZoom } from './mapBounds';
import { bochumCityBoundaryGeoJson } from '../data/bochumCityBoundary';
import { bochumPostalBoundariesGeoJson } from '../data/bochumPostalBoundaries';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { zoneRules } from '../data/zoneRules';
import type { ItemType, LatLngPosition, PlayerAsset, ExistingAsset, PrivateAsset } from '../types/assets';
import type { ZoneId } from '../types/zones';
import { ZoneProfileMedia } from '../ui/ZoneProfileMedia';
import L, { type PathOptions } from 'leaflet';
import { AssetMarkers } from './AssetMarkers';
import { getMapTileLayerConfig } from './mapTiles';

export type ZoneFeedback = {
  zoneId: ZoneId;
  status: 'allowed' | 'blocked';
  message: string;
};

export type PlacementFeedback = {
  status: 'allowed' | 'blocked';
  message: string;
};

export interface BochumMapProps {
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  privateAssets?: PrivateAsset[];
  selectedAssetId?: string;
  onSelectAsset: (id: string | undefined) => void;
  zoneFeedback?: ZoneFeedback;
  placementFeedback?: PlacementFeedback;
  placementDrag?: {
    itemType: ItemType;
    clientX: number;
    clientY: number;
  } | null;
  onDragPosition?: (position: LatLngPosition) => void;
  onDropAsset?: (position: LatLngPosition) => void;
  onDropOutside?: () => void;
  onDragLeave?: () => void;
  onSell?: (id: string) => void;
  placeableZones?: Record<string, boolean> | null;
}

interface MapEventsHandlerProps {
  onSelectAsset: (id: string | undefined) => void;
  onClearZoneInfo: () => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onSelectAsset,
  onClearZoneInfo
}) => {
  useMapEvents({
    click: (e) => {
      const originalEvent = (e as any).originalEvent;
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

const PointerPlacementHandler: React.FC<DragDropHandlerProps> = ({
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

const ZoneLabelPane: React.FC = () => {
  const map = useMap();

  useLayoutEffect(() => {
    const pane = map.getPane('zone-labels') ?? map.createPane('zone-labels');
    pane.style.zIndex = '350';
    pane.style.pointerEvents = 'none';
  }, [map]);

  return null;
};

const itemTypeLabels: Record<ItemType, string> = {
  solar: 'Solar',
  wind: 'Wind',
  storage: 'Speicher'
};

const demandProfileLabels = {
  commercial_core: 'Gewerbezentrum',
  mixed: 'Gemischt',
  campus: 'Campus',
  residential: 'Wohnen',
  suburban: 'Vorstadt'
} as const;

const acceptanceSensitivityLabels = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch'
} as const;

const cityBoundaryStyle: PathOptions = {
  color: '#ef4444',
  weight: 2.5,
  opacity: 0.95,
  fillOpacity: 0,
  interactive: false,
  className: 'bochum-city-boundary'
};

const postalBoundaryStyle: PathOptions = {
  color: '#2563eb',
  weight: 1.4,
  opacity: 0,
  fillOpacity: 0,
  interactive: false,
  className: 'bochum-postal-boundary'
};

type ZoneInfoPlacement = 'top' | 'right' | 'bottom' | 'left';

type ZoneInfoSelection = {
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

const getZoneClickAnchor = (event: any): ZoneInfoSelection['anchor'] => {
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

const getMapRenderSize = (element: HTMLDivElement | null) => {
  const rect = element?.getBoundingClientRect();

  return {
    width: rect?.width || fallbackMapSize.width,
    height: rect?.height || fallbackMapSize.height
  };
};

const getZoneInfoPosition = (
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

export const BochumMap: React.FC<BochumMapProps> = ({
  playerAssets,
  existingAssets,
  privateAssets = [],
  selectedAssetId,
  onSelectAsset,
  zoneFeedback,
  placementFeedback,
  placementDrag,
  onDragPosition,
  onDropAsset,
  onDropOutside,
  onDragLeave,
  onSell,
  placeableZones
}) => {
  const mapRootRef = useRef<HTMLDivElement | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<ZoneInfoSelection | null>(null);
  const tileLayerConfig = getMapTileLayerConfig(import.meta.env.CARTO_API_KEY);

  const getZoneStyle = (feature: any): PathOptions => {
    if (!feature || !feature.properties) return {};
    const zoneId = feature.properties.zoneId;
    const isFeedback = zoneFeedback && zoneFeedback.zoneId === zoneId;
    const isHovered = hoveredZoneId === zoneId;

    if (isFeedback) {
      const color = zoneFeedback.status === 'allowed' ? '#3BB273' : '#F06A6A';
      return {
        fillColor: color,
        fillOpacity: isHovered ? 0.24 : 0.14,
        color: color,
        className: 'bochum-zone-path',
        weight: 3,
        opacity: 0.78
      };
    }

    if (placeableZones) {
      const isAllowed = placeableZones[zoneId];
      const color = isAllowed ? '#3BB273' : '#F06A6A';
      return {
        fillColor: color,
        fillOpacity: isHovered ? 0.22 : 0.08,
        color: color,
        className: 'bochum-zone-path',
        weight: isHovered ? 2.5 : 1.25,
        opacity: isHovered ? 0.7 : 0.38
      };
    }

    return {
      fillColor: '#2F7A55',
      fillOpacity: isHovered ? 0.07 : 0,
      color: '#2F7A55',
      className: 'bochum-zone-path',
      weight: isHovered ? 1.75 : 1,
      opacity: 0.34
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const zoneId = feature.properties?.zoneId;
    const label = feature.properties?.label || zoneId;
    const tooltipText =
      zoneFeedback && zoneFeedback.zoneId === zoneId
        ? `${label}\n${zoneFeedback.message}`
        : label;

    layer.bindTooltip(tooltipText, {
      permanent: true,
      direction: 'center',
      className: 'zone-label-tooltip',
      pane: 'zone-labels',
      interactive: false
    });

    layer.on({
      mouseover: () => {
        setHoveredZoneId(zoneId);
      },
      mouseout: () => {
        setHoveredZoneId(null);
      },
      click: (event: any) => {
        if (!zoneId) {
          return;
        }

        const originalEvent = event.originalEvent;
        if (originalEvent) {
          originalEvent.__bochumZoneClickHandled = true;
          originalEvent.stopPropagation?.();
          L.DomEvent.stopPropagation(originalEvent);
        }

        setSelectedZoneInfo({
          zoneId,
          anchor: getZoneClickAnchor(event)
        });
      }
    });
  };

  const selectedZoneRule = selectedZoneInfo
    ? zoneRules.find((zoneRule) => zoneRule.zoneId === selectedZoneInfo.zoneId)
    : undefined;
  const selectedZonePosition =
    selectedZoneInfo && selectedZoneRule
      ? getZoneInfoPosition(selectedZoneInfo.anchor, getMapRenderSize(mapRootRef.current))
      : undefined;

  return (
    <div ref={mapRootRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        bounds={bochumBounds}
        maxBounds={bochumBounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoom={13}
        center={[51.48, 7.22]}
        style={{ height: '100%', width: '100%' }}
        maxBoundsViscosity={1.0}
      >
        <ZoneLabelPane />
        <TileLayer
          url={tileLayerConfig.url}
          attribution={tileLayerConfig.attribution}
          className={tileLayerConfig.className}
        />
        <GeoJSON
          data={bochumCityBoundaryGeoJson}
          style={() => cityBoundaryStyle}
          interactive={false}
        />
        <GeoJSON
          data={bochumPostalBoundariesGeoJson}
          style={() => postalBoundaryStyle}
          interactive={false}
        />
        <GeoJSON
          key={JSON.stringify(zoneFeedback) + JSON.stringify(placeableZones)}
          data={bochumZonesGeoJson}
          style={getZoneStyle}
          onEachFeature={onEachFeature}
        />
        <AssetMarkers
          playerAssets={playerAssets}
          existingAssets={existingAssets}
          privateAssets={privateAssets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={onSelectAsset}
          onSell={onSell}
        />
        <MapEventsHandler
          onSelectAsset={onSelectAsset}
          onClearZoneInfo={() => setSelectedZoneInfo(null)}
        />
        <PointerPlacementHandler
          placementDrag={placementDrag}
          onDragPosition={onDragPosition}
          onDropAsset={onDropAsset}
          onDropOutside={onDropOutside}
          onDragLeave={onDragLeave}
        />
      </MapContainer>
      {placementFeedback && (
        <div
          className={`placement-feedback placement-feedback-${placementFeedback.status}`}
          data-testid="placement-feedback"
          role="status"
        >
          {placementFeedback.message}
        </div>
      )}
      {selectedZoneRule && selectedZonePosition && (
        <div
          className="zone-info-card"
          data-testid="zone-info-card"
          data-placement={selectedZonePosition.placement}
          role="status"
          style={{
            position: 'absolute',
            left: `${selectedZonePosition.left}px`,
            top: `${selectedZonePosition.top}px`,
            zIndex: 1000,
            width: 'min(320px, calc(100% - 48px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <button
            type="button"
            className="zone-info-card__close"
            aria-label="Zone-Information schliessen"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedZoneInfo(null);
            }}
          >
            &times;
          </button>
          <ZoneProfileMedia
            zoneId={selectedZoneRule.zoneId}
            label={selectedZoneRule.label}
            className="zone-info-card__media"
          />
          <div className="zone-info-card__header">
            <strong>{selectedZoneRule.label}</strong>
            <span>{demandProfileLabels[selectedZoneRule.demandProfile]}</span>
          </div>
          <div className="zone-info-card__meta">
            <span>
              Akzeptanzsensibilitaet:{' '}
              {acceptanceSensitivityLabels[selectedZoneRule.acceptanceSensitivity]}
            </span>
            <span>
              Erlaubt:{' '}
              {selectedZoneRule.allowedItemTypes.map((itemType) => itemTypeLabels[itemType]).join(', ')}
            </span>
            <span>
              Kapazität: Solar {selectedZoneRule.capacity.solar}, Wind{' '}
              {selectedZoneRule.capacity.wind}, Speicher {selectedZoneRule.capacity.storage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
