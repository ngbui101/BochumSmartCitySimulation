import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { bochumBounds, minZoom, maxZoom } from './mapBounds';
import { bochumZonesGeoJson } from '../data/bochumZones';
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
  onDragLeave?: () => void;
  onSell?: (id: string) => void;
  placeableZones?: Record<string, boolean> | null;
}

interface MapEventsHandlerProps {
  onSelectAsset: (id: string | undefined) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onSelectAsset
}) => {
  useMapEvents({
    click: (e) => {
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
  onDragLeave?: () => void;
}

const PointerPlacementHandler: React.FC<DragDropHandlerProps> = ({
  placementDrag,
  onDragPosition,
  onDropAsset,
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
        onDragLeave?.();
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
  }, [placementDrag, map, onDragLeave, onDragPosition, onDropAsset]);

  return null;
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
  onDragLeave,
  onSell,
  placeableZones
}) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

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
        weight: isHovered ? 2.5 : 1.5,
        opacity: 0.6
      };
    }

    return {
      fillColor: '#3b82f6',
      fillOpacity: isHovered ? 0.25 : 0.05,
      color: '#3b82f6',
      weight: isHovered ? 2.5 : 1.5,
      opacity: 0.6
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
      }
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
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
        <MapEventsHandler onSelectAsset={onSelectAsset} />
        <PointerPlacementHandler
          placementDrag={placementDrag}
          onDragPosition={onDragPosition}
          onDropAsset={onDropAsset}
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
    </div>
  );
};
