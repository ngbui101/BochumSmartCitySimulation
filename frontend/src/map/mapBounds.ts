import type { LatLngBoundsExpression } from 'leaflet';
import { bochumCityBoundaryGeoJson } from '../data/bochumCityBoundary';

const cityBoundsPadding = {
  lat: 0.02,
  lng: 0.02
};

function roundCoordinate(value: number): number {
  return Number(value.toFixed(3));
}

function createPaddedCityBounds(): LatLngBoundsExpression {
  const [minLng, minLat, maxLng, maxLat] = bochumCityBoundaryGeoJson.features[0].bbox ?? [
    7.1020817,
    51.4105176,
    7.3493347,
    51.5313721
  ];

  return [
    [
      roundCoordinate(minLat - cityBoundsPadding.lat),
      roundCoordinate(minLng - cityBoundsPadding.lng)
    ],
    [
      roundCoordinate(maxLat + cityBoundsPadding.lat),
      roundCoordinate(maxLng + cityBoundsPadding.lng)
    ]
  ];
}

export const bochumBounds: LatLngBoundsExpression = createPaddedCityBounds();

export const minZoom = 12;
export const maxZoom = 16;
