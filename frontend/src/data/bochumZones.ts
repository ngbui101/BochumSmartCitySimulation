import bochumZonesGeoJsonRaw from './bochumBoroughZones.osm.geojson?raw';
import type { ZoneFeatureCollection } from '../simulation/zoneDetection';

export const bochumZonesGeoJson = JSON.parse(bochumZonesGeoJsonRaw) as ZoneFeatureCollection;
