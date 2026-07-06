import bochumCityBoundaryGeoJsonRaw from './bochumCityBoundary.osm.geojson?raw';

type CityBoundaryFeatureCollection = {
  type: 'FeatureCollection';
  licence?: string;
  features: Array<{
    type: 'Feature';
    properties: {
      name?: string;
      osm_id?: number;
      osm_type?: string;
      dataConfidence?: 'osm-boundary';
      [key: string]: unknown;
    };
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: unknown;
    };
    bbox?: number[];
  }>;
};

const parsedBoundary = JSON.parse(
  bochumCityBoundaryGeoJsonRaw
) as CityBoundaryFeatureCollection;

export const bochumCityBoundaryGeoJson: CityBoundaryFeatureCollection = {
  ...parsedBoundary,
  features: parsedBoundary.features.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      dataConfidence: 'osm-boundary'
    }
  }))
};
