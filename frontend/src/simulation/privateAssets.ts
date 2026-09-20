import { bochumZonesGeoJson } from '../data/bochumZones';
import { itemDefinitions } from '../data/itemDefinitions';
import type { PrivateAsset } from '../types/assets';
import type { SubsidyProgram } from '../types/game';
import type { ZoneId } from '../types/zones';
import { findZoneForPoint } from './zoneDetection';

export const PRIVATE_ASSET_THRESHOLD = 600_000;

type Coordinate = readonly [number, number];

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function getOuterRingCoordinates(feature: (typeof bochumZonesGeoJson.features)[number]): Coordinate[] {
  const geometry = feature.geometry;

  if (!geometry) {
    return [];
  }

  if (geometry.type === 'Polygon') {
    return (geometry.coordinates[0] ?? []) as Coordinate[];
  }

  return (geometry.coordinates[0]?.[0] ?? []) as Coordinate[];
}

function chooseZone(seed: number): {
  zoneId: ZoneId;
  ring: Coordinate[];
} {
  const candidates = bochumZonesGeoJson.features
    .map((feature) => ({
      zoneId: feature.properties?.zoneId as ZoneId | undefined,
      ring: getOuterRingCoordinates(feature)
    }))
    .filter((candidate): candidate is { zoneId: ZoneId; ring: Coordinate[] } => Boolean(candidate.zoneId && candidate.ring.length));

  const candidate = candidates[Math.floor(seededRandom(seed) * candidates.length)] ?? candidates[0];

  if (!candidate) {
    throw new Error('Keine Bochumer Spielzone für private Anlage gefunden.');
  }

  return candidate;
}

function randomPositionInZone(zoneId: ZoneId, ring: Coordinate[], seed: number) {
  const lngs = ring.map(([lng]) => lng);
  const lats = ring.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const lat = minLat + (maxLat - minLat) * seededRandom(seed + attempt * 2 + 1);
    const lng = minLng + (maxLng - minLng) * seededRandom(seed + attempt * 2 + 2);
    const position = { lat, lng };

    if (findZoneForPoint(position, bochumZonesGeoJson) === zoneId) {
      return position;
    }
  }

  const center = ring.reduce(
    (sum, [lng, lat]) => ({ lat: sum.lat + lat, lng: sum.lng + lng }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: center.lat / ring.length,
    lng: center.lng / ring.length
  };
}

export function createPrivateAsset(
  program: SubsidyProgram,
  monthIndex: number,
  ordinal: number,
  existingCount: number
): PrivateAsset {
  const { zoneId, ring } = chooseZone(monthIndex * 101 + ordinal * 17 + existingCount * 7 + (program === 'storage' ? 1 : 0));
  const position = randomPositionInZone(zoneId, ring, monthIndex * 1009 + ordinal * 31 + existingCount * 13);
  const isSolar = program === 'solar';
  const label = isSolar ? 'Solaranlage' : 'Energiespeicher';
  const itemDefinition = itemDefinitions.find((item) => item.itemType === program);
  const gridReliefCapacity =
    program === 'solar' ? itemDefinition?.productionValue ?? 0 : itemDefinition?.storageValue ?? 0;

  return {
    id: `private-${program}-${monthIndex}-${existingCount + ordinal}`,
    name: `Private ${label} #${existingCount + ordinal}`,
    itemType: program,
    assetTypeLabel: `${label} (privat)`,
    zoneId,
    position,
    statusLabel: 'Privat aktiv',
    roleDescription: isSolar
      ? 'Bürgeranlage: erzeugt Strom privat und entlastet das Netz.'
      : 'Bürgeranlage: speichert Strom privat und stabilisiert das Netz.',
    modifiable: false,
    sellable: false,
    operatingCost: 0,
    gridReliefCapacity,
    ownership: 'private',
    dataConfidence: 'mvp-placeholder'
  };
}
