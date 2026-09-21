declare module '*.geojson' {
  const value: import('geojson').GeoJsonObject;
  export default value;
}

declare module '*.geojson?raw' {
  const value: string;
  export default value;
}
