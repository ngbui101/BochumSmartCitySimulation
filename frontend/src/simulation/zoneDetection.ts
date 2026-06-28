import type { LatLngPosition } from '../types/assets';
import type { ZoneId } from '../types/zones';

export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: readonly (readonly (readonly number[])[])[];
};

export type GeoJsonMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: readonly (readonly (readonly (readonly number[])[])[])[];
};

export type ZoneFeature = {
  type: 'Feature';
  properties?: {
    zoneId?: string;
  };
  geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null;
};

export type ZoneFeatureCollection = {
  type: 'FeatureCollection';
  features: readonly ZoneFeature[];
};

const zoneIds: ZoneId[] = [
  'innenstadt',
  'wattenscheid',
  'querenburg',
  'langendreer',
  'gerthe_harpen',
  'weitmar_linden',
  'stiepel'
];

function isZoneId(value: string | undefined): value is ZoneId {
  return zoneIds.includes(value as ZoneId);
}

function isPointInRing(point: LatLngPosition, ring: readonly (readonly number[])[]): boolean {
  let isInside = false;
  const x = point.lng;
  const y = point.lat;

  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const currentPoint = ring[current];
    const previousPoint = ring[previous];
    const currentX = currentPoint[0];
    const currentY = currentPoint[1];
    const previousX = previousPoint[0];
    const previousY = previousPoint[1];

    const crossesLatitude = (currentY > y) !== (previousY > y);
    const intersectX =
      ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;

    if (crossesLatitude && x < intersectX) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function isPointInPolygon(
  point: LatLngPosition,
  polygon: readonly (readonly (readonly number[])[])[]
): boolean {
  const [outerRing, ...holes] = polygon;

  if (!outerRing || !isPointInRing(point, outerRing)) {
    return false;
  }

  return !holes.some((hole) => isPointInRing(point, hole));
}

export function findZoneForPoint(
  latLng: LatLngPosition,
  zonesGeoJson: ZoneFeatureCollection
): ZoneId | null {
  for (const feature of zonesGeoJson.features) {
    const zoneId = feature.properties?.zoneId;
    const geometry = feature.geometry;

    if (!isZoneId(zoneId) || !geometry) {
      continue;
    }

    if (geometry.type === 'Polygon' && isPointInPolygon(latLng, geometry.coordinates)) {
      return zoneId;
    }

    if (
      geometry.type === 'MultiPolygon' &&
      geometry.coordinates.some((polygon) => isPointInPolygon(latLng, polygon))
    ) {
      return zoneId;
    }
  }

  return null;
}
