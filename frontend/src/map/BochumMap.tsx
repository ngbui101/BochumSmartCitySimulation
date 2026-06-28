import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { bochumBounds, minZoom, maxZoom } from './mapBounds';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { zoneRules } from '../data/zoneRules';
import type { ItemType, LatLngPosition, PlayerAsset, ExistingAsset } from '../types/assets';
import type { ZoneId } from '../types/zones';
import L, { type PathOptions } from 'leaflet';
import { AssetMarkers } from './AssetMarkers';

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

const zoneProfileThemes: Record<
  ZoneId,
  { from: string; to: string; accent: string; initials: string }
> = {
  innenstadt: { from: '#1f6f8b', to: '#f2c14e', accent: '#ffffff', initials: 'IN' },
  wattenscheid: { from: '#547aa5', to: '#7fc8a9', accent: '#ffffff', initials: 'WA' },
  querenburg: { from: '#596e79', to: '#88c0d0', accent: '#ffffff', initials: 'QU' },
  langendreer: { from: '#2f855a', to: '#f6ad55', accent: '#ffffff', initials: 'LA' },
  gerthe_harpen: { from: '#6b46c1', to: '#38b2ac', accent: '#ffffff', initials: 'GH' },
  weitmar_linden: { from: '#805ad5', to: '#68d391', accent: '#ffffff', initials: 'WL' },
  stiepel: { from: '#2b6cb0', to: '#9ae6b4', accent: '#ffffff', initials: 'ST' }
};

const getZoneProfileImage = (zoneId: ZoneId, label: string): string => {
  const theme = zoneProfileThemes[zoneId];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="72" viewBox="0 0 96 72">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${theme.from}"/>
          <stop offset="1" stop-color="${theme.to}"/>
        </linearGradient>
      </defs>
      <rect width="96" height="72" rx="12" fill="url(#bg)"/>
      <path d="M10 52 C24 38, 34 44, 46 30 S72 18, 86 28" fill="none" stroke="${theme.accent}" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
      <path d="M12 18 H82 M22 12 V60 M46 10 V62 M70 14 V58" stroke="${theme.accent}" stroke-width="2" opacity="0.32"/>
      <circle cx="74" cy="18" r="8" fill="${theme.accent}" opacity="0.34"/>
      <text x="14" y="62" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${theme.accent}">${theme.initials}</text>
      <title>${label}</title>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
const zoneInfoCardHeight = 250;
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

  const getZoneStyle = (feature: any): PathOptions => {
    if (!feature || !feature.properties) return {};
    const zoneId = feature.properties.zoneId;
    const isFeedback = zoneFeedback && zoneFeedback.zoneId === zoneId;
    const isHovered = hoveredZoneId === zoneId;

    if (isFeedback) {
      const color = zoneFeedback.status === 'allowed' ? '#22c55e' : '#ef4444';
      return {
        fillColor: color,
        fillOpacity: isHovered ? 0.35 : 0.15,
        color: color,
        className: 'bochum-zone-path',
        weight: 3,
        opacity: 0.8
      };
    }

    if (placeableZones) {
      const isAllowed = placeableZones[zoneId];
      const color = isAllowed ? '#22c55e' : '#ef4444';
      return {
        fillColor: color,
        fillOpacity: isHovered ? 0.35 : 0.15,
        color: color,
        className: 'bochum-zone-path',
        weight: isHovered ? 2.5 : 1.5,
        opacity: 0.6
      };
    }

    return {
      fillColor: '#3b82f6',
      fillOpacity: isHovered ? 0.25 : 0,
      color: '#3b82f6',
      className: 'bochum-zone-path',
      weight: isHovered ? 2.5 : 1.5,
      opacity: isHovered ? 0.6 : 0
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
      sticky: true,
      direction: 'center',
      className: 'zone-tooltip'
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <GeoJSON
          key={JSON.stringify(zoneFeedback) + JSON.stringify(placeableZones) + (hoveredZoneId || '')}
          data={bochumZonesGeoJson}
          style={getZoneStyle}
          onEachFeature={onEachFeature}
        />
        <AssetMarkers
          playerAssets={playerAssets}
          existingAssets={existingAssets}
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
            gap: '8px',
            padding: '14px',
            color: '#17211b',
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #cbd8d0',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
            fontSize: '0.85rem',
            lineHeight: 1.35
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '96px 1fr 28px',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <img
              src={getZoneProfileImage(selectedZoneRule.zoneId, selectedZoneRule.label)}
              alt={`${selectedZoneRule.label} Profilbild`}
              style={{
                width: '96px',
                height: '72px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #cbd8d0'
              }}
            />
            <strong style={{ fontSize: '1rem' }}>{selectedZoneRule.label}</strong>
            <button
              type="button"
              aria-label="Zone-Information schliessen"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedZoneInfo(null);
              }}
              style={{
                width: '28px',
                height: '28px',
                background: 'none',
                border: 'none',
                borderWidth: 0,
                borderStyle: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '1.25rem',
                lineHeight: 1,
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>
          </div>
          <span>Profil: {demandProfileLabels[selectedZoneRule.demandProfile]}</span>
          <span>
            Akzeptanzsensibilitaet:{' '}
            {acceptanceSensitivityLabels[selectedZoneRule.acceptanceSensitivity]}
          </span>
          <span>
            Erlaubt:{' '}
            {selectedZoneRule.allowedItemTypes.map((itemType) => itemTypeLabels[itemType]).join(', ')}
          </span>
          <span>
            Kapazitaet: Solar {selectedZoneRule.capacity.solar}, Wind{' '}
            {selectedZoneRule.capacity.wind}, Speicher {selectedZoneRule.capacity.storage}
          </span>
        </div>
      )}
    </div>
  );
};
