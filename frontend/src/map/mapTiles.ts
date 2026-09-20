export type MapTileLayerConfig = {
  url: string;
  attribution: string;
  className: string;
};

const cozyTileClassName = 'cozy-map-tiles';

export function getMapTileLayerConfig(apiKey?: string): MapTileLayerConfig {
  const normalizedApiKey = apiKey?.trim();

  if (!normalizedApiKey) {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: cozyTileClassName
    };
  }

  return {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(normalizedApiKey)}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    className: cozyTileClassName
  };
}
