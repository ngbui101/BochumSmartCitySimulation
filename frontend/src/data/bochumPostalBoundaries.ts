import bochumPostalBoundariesGeoJsonRaw from './bochumPostalBoundaries.osm.geojson?raw';

type PostalBoundaryFeatureCollection = {
  type: 'FeatureCollection';
  licence?: string;
  source?: string;
  features: Array<{
    type: 'Feature';
    properties: {
      postal_code: string;
      note?: string;
      osm_id: number;
      osm_type: 'relation';
      boundary: 'postal_code';
      dataConfidence: 'osm-postal-boundary';
    };
    geometry: {
      type: 'MultiLineString';
      coordinates: number[][][];
    };
  }>;
};

export const bochumPostalBoundariesGeoJson = JSON.parse(
  bochumPostalBoundariesGeoJsonRaw
) as PostalBoundaryFeatureCollection;
