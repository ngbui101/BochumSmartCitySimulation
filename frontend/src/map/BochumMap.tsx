import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { bochumBounds, minZoom, maxZoom } from './mapBounds';
import { bochumCityBoundaryGeoJson } from '../data/bochumCityBoundary';
import { bochumPostalBoundariesGeoJson } from '../data/bochumPostalBoundaries';
import { bochumZonesGeoJson } from '../data/bochumZones';
import { zoneRules } from '../data/zoneRules';
import type { ItemType, LatLngPosition, PlayerAsset, ExistingAsset, PrivateAsset } from '../types/assets';
import type { ZoneId } from '../types/zones';
import L, { type Layer, type LeafletMouseEvent, type PathOptions } from 'leaflet';
import type { Feature, Geometry } from 'geojson';
import { AssetMarkers } from './AssetMarkers';
import { getMapTileLayerConfig } from './mapTiles';

import type { PlacementFeedback, ZoneFeedback } from './placementTypes';
export type { PlacementFeedback, ZoneFeedback } from './placementTypes';
import { MapEventsHandler, PointerPlacementHandler, ZoneLabelPane } from './mapInteractions';
import type { ZoneClickEvent } from './mapInteractions';
import { getZoneClickAnchor, getMapRenderSize, getZoneInfoPosition } from './zoneInfoPosition';
import type { ZoneInfoSelection } from './zoneInfoPosition';
import { ZoneInfoCard } from './ZoneInfoCard';

type ZoneMapFeature = Feature<Geometry, { zoneId?: ZoneId; label?: string }>;

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
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<ZoneInfoSelection | null>(null);
  const tileLayerConfig = getMapTileLayerConfig(import.meta.env.CARTO_API_KEY);

  const getZoneStyle = (feature?: ZoneMapFeature, hoveredZoneId?: string): PathOptions => {
    if (!feature?.properties?.zoneId) return {};
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

  const onEachFeature = (feature: ZoneMapFeature, layer: Layer) => {
    const zoneId = feature.properties?.zoneId;
    const label = feature.properties?.label || zoneId;
    const tooltipText =
      zoneFeedback && zoneFeedback.zoneId === zoneId
        ? `${label}\n${zoneFeedback.message}`
        : label;

    layer.bindTooltip(tooltipText ?? '', {
      permanent: true,
      direction: 'center',
      className: 'zone-label-tooltip',
      pane: 'zone-labels',
      interactive: false
    });

    layer.on({
      mouseover: () => {
        (layer as L.Path).setStyle(getZoneStyle(feature, zoneId));
      },
      mouseout: () => {
        (layer as L.Path).setStyle(getZoneStyle(feature));
      },
      click: (event: LeafletMouseEvent) => {
        if (!zoneId) {
          return;
        }

        const originalEvent = event.originalEvent as ZoneClickEvent | undefined;
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
        <ZoneInfoCard
          zone={selectedZoneRule}
          position={selectedZonePosition}
          onClose={() => setSelectedZoneInfo(null)}
        />
      )}
    </div>
  );
};
