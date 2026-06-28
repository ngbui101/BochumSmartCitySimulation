import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import { bochumBounds, minZoom, maxZoom } from './mapBounds';
import bochumZonesGeoJsonRaw from '../data/bochumZones.geojson?raw';
const bochumZonesGeoJson = JSON.parse(bochumZonesGeoJsonRaw);
import type { PlayerAsset, ExistingAsset } from '../types/assets';
import type { PathOptions } from 'leaflet';

export interface BochumMapProps {
  playerAssets: PlayerAsset[];
  existingAssets: ExistingAsset[];
  selectedAssetId?: string;
  onSelectAsset: (id: string | undefined) => void;
  zoneFeedback?: { zoneId: string; status: 'allowed' | 'blocked'; message: string };
  onDropAsset?: (position: { lat: number; lng: number }) => void;
}

interface MapEventsHandlerProps {
  onSelectAsset: (id: string | undefined) => void;
  onDropAsset?: (position: { lat: number; lng: number }) => void;
}

const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onSelectAsset,
  onDropAsset
}) => {
  useMapEvents({
    click: (e) => {
      // Clear selection when map background is clicked
      onSelectAsset(undefined);
      if (onDropAsset) {
        onDropAsset({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
};

export const BochumMap: React.FC<BochumMapProps> = ({
  playerAssets,
  existingAssets,
  selectedAssetId,
  onSelectAsset,
  zoneFeedback,
  onDropAsset
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

    layer.bindTooltip(label, {
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
          key={JSON.stringify(zoneFeedback) + (hoveredZoneId || '')}
          data={bochumZonesGeoJson}
          style={getZoneStyle}
          onEachFeature={onEachFeature}
        />
        <MapEventsHandler
          onSelectAsset={onSelectAsset}
          onDropAsset={onDropAsset}
        />
      </MapContainer>
    </div>
  );
};
