import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BochumMap } from '../../src/map/BochumMap';

// Mock layer interface for simulating leaflet events in test
interface MockLayer {
  bindTooltip: any;
  on: any;
  setStyle: any;
}

let lastGeoJsonProps: any = null;
const registeredLayers: { feature: any; layer: MockLayer }[] = [];

// Mock react-leaflet to prevent JSDOM rendering issues with real Leaflet
vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children, bounds, maxBounds, minZoom, maxZoom, zoom, center, style }: any) => (
      <div
        data-testid="mock-map-container"
        data-bounds={JSON.stringify(bounds)}
        data-max-bounds={JSON.stringify(maxBounds)}
        data-min-zoom={minZoom}
        data-max-zoom={maxZoom}
        data-zoom={zoom}
        data-center={JSON.stringify(center)}
        style={style}
      >
        {children}
      </div>
    ),
    TileLayer: ({ url, attribution }: any) => (
      <div data-testid="mock-tile-layer" data-url={url} data-attribution={attribution} />
    ),
    GeoJSON: (props: any) => {
      lastGeoJsonProps = props;
      
      React.useEffect(() => {
        if (props.onEachFeature && props.data && props.data.features) {
          props.data.features.forEach((feature: any) => {
            const mockLayer: MockLayer = {
              bindTooltip: vi.fn(),
              on: vi.fn((events: any) => {
                (mockLayer.on as any)._events = events;
              }),
              setStyle: vi.fn()
            };
            (mockLayer.on as any)._events = {};
            props.onEachFeature(feature, mockLayer);
            registeredLayers.push({ feature, layer: mockLayer });
          });
        }
      }, [props.data, props.onEachFeature]);

      return (
        <div data-testid="mock-geojson" />
      );
    },
    useMapEvents: (events: any) => {
      (globalThis as any).mockMapEvents = events;
      return null;
    }
  };
});

describe('BochumMap component', () => {
  const defaultProps = {
    playerAssets: [],
    existingAssets: [],
    onSelectAsset: vi.fn(),
    onDropAsset: vi.fn()
  };

  beforeEach(() => {
    lastGeoJsonProps = null;
    registeredLayers.length = 0;
    (globalThis as any).mockMapEvents = null;
    vi.clearAllMocks();
  });

  it('renders MapContainer with correct bounds and zoom limits', () => {
    render(<BochumMap {...defaultProps} />);
    const mapContainer = screen.getByTestId('mock-map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer.getAttribute('data-bounds')).toContain('51.35');
    expect(mapContainer.getAttribute('data-bounds')).toContain('7.05');
    expect(mapContainer.getAttribute('data-min-zoom')).toBe('12');
    expect(mapContainer.getAttribute('data-max-zoom')).toBe('16');
  });

  it('renders TileLayer with CartoDB url and proper attribution', () => {
    render(<BochumMap {...defaultProps} />);
    const tileLayer = screen.getByTestId('mock-tile-layer');
    expect(tileLayer).toBeInTheDocument();
    expect(tileLayer.getAttribute('data-url')).toBe(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    );
    expect(tileLayer.getAttribute('data-attribution')).toContain('CARTO');
  });

  it('renders GeoJSON layer and binds tooltips to features', () => {
    render(<BochumMap {...defaultProps} />);
    const geoJson = screen.getByTestId('mock-geojson');
    expect(geoJson).toBeInTheDocument();
    expect(registeredLayers.length).toBeGreaterThan(0);
    
    // Check that bindTooltip is called with zone label
    registeredLayers.forEach(({ feature, layer }) => {
      expect(layer.bindTooltip).toHaveBeenCalledWith(
        feature.properties.label,
        expect.any(Object)
      );
    });
  });

  it('applies default styles to GeoJSON features', () => {
    render(<BochumMap {...defaultProps} />);
    const styleFn = lastGeoJsonProps.style;
    const feature = registeredLayers[0].feature;
    const style = styleFn(feature);
    
    expect(style.color).toBe('#3b82f6');
    expect(style.fillColor).toBe('#3b82f6');
    expect(style.fillOpacity).toBe(0.05); // default hover: false
  });

  it('handles zone hover events correctly', () => {
    render(<BochumMap {...defaultProps} />);
    const layerEntry = registeredLayers[0];
    const mouseoverHandler = (layerEntry.layer.on as any)._events.mouseover;
    const mouseoutHandler = (layerEntry.layer.on as any)._events.mouseout;

    expect(mouseoverHandler).toBeDefined();
    expect(mouseoutHandler).toBeDefined();
  });

  it('highlights the zone in green if feedback status is allowed', () => {
    const feedback = {
      zoneId: 'innenstadt',
      status: 'allowed' as const,
      message: 'Zone permits this asset type'
    };
    render(<BochumMap {...defaultProps} zoneFeedback={feedback} />);
    
    const styleFn = lastGeoJsonProps.style;
    const innenstadtFeature = registeredLayers.find(
      (l) => l.feature.properties.zoneId === 'innenstadt'
    )?.feature;
    
    expect(innenstadtFeature).toBeDefined();
    const style = styleFn(innenstadtFeature);
    expect(style.color).toBe('#22c55e');
    expect(style.fillColor).toBe('#22c55e');
  });

  it('highlights the zone in red if feedback status is blocked', () => {
    const feedback = {
      zoneId: 'wattenscheid',
      status: 'blocked' as const,
      message: 'Zone is blocked'
    };
    render(<BochumMap {...defaultProps} zoneFeedback={feedback} />);
    
    const styleFn = lastGeoJsonProps.style;
    const wattenscheidFeature = registeredLayers.find(
      (l) => l.feature.properties.zoneId === 'wattenscheid'
    )?.feature;
    
    expect(wattenscheidFeature).toBeDefined();
    const style = styleFn(wattenscheidFeature);
    expect(style.color).toBe('#ef4444');
    expect(style.fillColor).toBe('#ef4444');
  });

  it('handles map click by calling onSelectAsset(undefined) and onDropAsset', () => {
    const onSelectAsset = vi.fn();
    const onDropAsset = vi.fn();
    render(
      <BochumMap
        {...defaultProps}
        onSelectAsset={onSelectAsset}
        onDropAsset={onDropAsset}
      />
    );
    
    const mockMapEvents = (globalThis as any).mockMapEvents;
    expect(mockMapEvents).toBeDefined();
    expect(mockMapEvents.click).toBeDefined();

    mockMapEvents.click({
      latlng: { lat: 51.48, lng: 7.22 }
    });

    expect(onSelectAsset).toHaveBeenCalledWith(undefined);
    expect(onDropAsset).toHaveBeenCalledWith({ lat: 51.48, lng: 7.22 });
  });
});
