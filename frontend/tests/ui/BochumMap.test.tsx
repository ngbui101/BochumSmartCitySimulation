import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BochumMap } from '../../src/map/BochumMap';

// Mock layer interface for simulating leaflet events in test
interface MockLayer {
  bindTooltip: any;
  on: any;
  setStyle: any;
}

let lastGeoJsonProps: any = null;
const geoJsonLayers: any[] = [];
const registeredLayers: { feature: any; layer: MockLayer }[] = [];
const mockWindowEvents: Record<string, EventListener> = {};

// Mock react-leaflet to prevent JSDOM rendering issues with real Leaflet
vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({
      children,
      bounds,
      maxBounds,
      minZoom,
      maxZoom,
      zoom,
      center,
      style,
      maxBoundsViscosity
    }: any) => (
      <div
        data-testid="mock-map-container"
        data-bounds={JSON.stringify(bounds)}
        data-max-bounds={JSON.stringify(maxBounds)}
        data-min-zoom={minZoom}
        data-max-zoom={maxZoom}
        data-zoom={zoom}
        data-center={JSON.stringify(center)}
        data-max-bounds-viscosity={maxBoundsViscosity}
        style={style}
      >
        {children}
      </div>
    ),
    TileLayer: ({ url, attribution }: any) => (
      <div data-testid="mock-tile-layer" data-url={url} data-attribution={attribution} />
    ),
    GeoJSON: (props: any) => {
      geoJsonLayers.push(props);
      if (props.onEachFeature) {
        lastGeoJsonProps = props;
      }
      
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

      const staticLayerTestId = props.data.features[0].properties.postal_code
        ? 'mock-postal-boundaries'
        : 'mock-city-boundary';

      return <div data-testid={props.onEachFeature ? 'mock-geojson' : staticLayerTestId} />;
    },
    useMapEvents: (events: any) => {
      (globalThis as any).mockMapEvents = events;
      return null;
    },
    useMap: () => ({
      getContainer: () => ({
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          right: 1000,
          bottom: 1000,
          width: 1000,
          height: 1000
        })
      }),
      containerPointToLatLng: (point: { x: number; y: number }) => ({
        lat: 51 + point.y / 1000,
        lng: 7 + point.x / 1000
      })
    })
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
    geoJsonLayers.length = 0;
    registeredLayers.length = 0;
    Object.keys(mockWindowEvents).forEach((key) => {
      delete mockWindowEvents[key];
    });
    (globalThis as any).mockMapEvents = null;
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(window, 'addEventListener').mockImplementation((eventName, handler) => {
      mockWindowEvents[eventName] = handler as EventListener;
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => undefined);
  });

  it('renders MapContainer with correct bounds and zoom limits', () => {
    render(<BochumMap {...defaultProps} />);
    const mapContainer = screen.getByTestId('mock-map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer.getAttribute('data-bounds')).toBe('[[51.391,7.082],[51.551,7.369]]');
    expect(mapContainer.getAttribute('data-max-bounds')).toBe('[[51.391,7.082],[51.551,7.369]]');
    expect(mapContainer.getAttribute('data-max-bounds-viscosity')).toBe('1');
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

  it('renders a visible non-interactive city boundary line above the base map', () => {
    render(<BochumMap {...defaultProps} />);

    expect(screen.getByTestId('mock-city-boundary')).toBeInTheDocument();

    const boundaryLayer = geoJsonLayers.find((layer) => layer.interactive === false);
    expect(boundaryLayer).toBeDefined();
    expect(boundaryLayer.data.licence).toContain('OpenStreetMap contributors');
    expect(boundaryLayer.data.features[0].properties.name).toBe('Bochum');
    expect(boundaryLayer.data.features[0].properties.osm_id).toBe(62644);
    expect(boundaryLayer.data.features[0].properties.osm_type).toBe('relation');
    expect(boundaryLayer.data.features[0].properties.dataConfidence).toBe('osm-boundary');

    const boundaryStyle = boundaryLayer.style();
    expect(boundaryStyle).toEqual(
      expect.objectContaining({
        className: 'bochum-city-boundary',
        color: '#ef4444',
        fillOpacity: 0,
        interactive: false,
        opacity: 0.95,
        weight: 2.5
      })
    );
  });

  it('renders visible non-interactive postcode boundary lines from OpenStreetMap', () => {
    render(<BochumMap {...defaultProps} />);

    expect(screen.getByTestId('mock-postal-boundaries')).toBeInTheDocument();

    const postalLayer = geoJsonLayers.find(
      (layer) => layer.data.features[0].properties.postal_code
    );
    expect(postalLayer).toBeDefined();
    expect(postalLayer.interactive).toBe(false);
    expect(postalLayer.data.licence).toContain('OpenStreetMap contributors');
    expect(postalLayer.data.features).toHaveLength(18);
    expect(postalLayer.data.features.map((feature: any) => feature.properties.postal_code)).toContain(
      '44787'
    );

    const postalStyle = postalLayer.style();
    expect(postalStyle).toEqual(
      expect.objectContaining({
        className: 'bochum-postal-boundary',
        color: '#2563eb',
        fillOpacity: 0,
        interactive: false,
        opacity: 0.62,
        weight: 1.4
      })
    );
  });

  it('hides zone boundaries by default', () => {
    render(<BochumMap {...defaultProps} />);
    const styleFn = lastGeoJsonProps.style;
    const feature = registeredLayers[0].feature;
    const style = styleFn(feature);
    
    expect(style.className).toBe('bochum-zone-path');
    expect(style.color).toBe('#2F7A55');
    expect(style.fillColor).toBe('#2F7A55');
    expect(style.fillOpacity).toBe(0);
    expect(style.opacity).toBe(0);
  });

  it('handles zone hover events correctly', () => {
    render(<BochumMap {...defaultProps} />);
    const layerEntry = registeredLayers[0];
    const mouseoverHandler = (layerEntry.layer.on as any)._events.mouseover;
    const mouseoutHandler = (layerEntry.layer.on as any)._events.mouseout;

    expect(mouseoverHandler).toBeDefined();
    expect(mouseoutHandler).toBeDefined();
  });

  it('shows zone information when a zone is clicked and hides it on map click', () => {
    render(<BochumMap {...defaultProps} />);
    const suedLayer = registeredLayers.find(
      (entry) => entry.feature.properties.zoneId === 'sued'
    )?.layer;

    expect(suedLayer).toBeDefined();

    const clickHandler = (suedLayer!.on as any)._events.click;
    expect(clickHandler).toBeDefined();
    const originalEvent = {
      stopPropagation: vi.fn()
    };

    act(() => {
      clickHandler({
        originalEvent,
        containerPoint: { x: 120, y: 360 }
      });
    });

    const zoneInfoCard = screen.getByTestId('zone-info-card');
    expect(zoneInfoCard).toHaveTextContent('Süd');
    expect(zoneInfoCard).toHaveTextContent('Solar');
    expect(zoneInfoCard).toHaveTextContent('Speicher');
    expect(zoneInfoCard).toHaveTextContent('Campus');
    expect(zoneInfoCard).toHaveAttribute('data-placement', 'right');
    expect(zoneInfoCard).not.toHaveStyle({ top: '24px', right: '24px' });

    const mockMapEvents = (globalThis as any).mockMapEvents;
    act(() => {
      mockMapEvents.click({
        originalEvent,
        latlng: { lat: 51.48, lng: 7.22 }
      });
    });

    expect(screen.getByTestId('zone-info-card')).toHaveTextContent('Süd');

    act(() => {
      mockMapEvents.click({
        latlng: { lat: 51.48, lng: 7.22 }
      });
    });

    expect(screen.queryByTestId('zone-info-card')).not.toBeInTheDocument();
  });

  it.each([
    [{ x: 120, y: 500 }, 'right'],
    [{ x: 880, y: 500 }, 'left'],
    [{ x: 500, y: 120 }, 'bottom'],
    [{ x: 500, y: 880 }, 'top']
  ] as const)('places zone information %s from the selected zone anchor', (containerPoint, placement) => {
    render(<BochumMap {...defaultProps} />);
    const mitteLayer = registeredLayers.find(
      (entry) => entry.feature.properties.zoneId === 'mitte'
    )?.layer;

    expect(mitteLayer).toBeDefined();

    const clickHandler = (mitteLayer!.on as any)._events.click;

    act(() => {
      clickHandler({
        originalEvent: {
          stopPropagation: vi.fn()
        },
        containerPoint
      });
    });

    expect(screen.getByTestId('zone-info-card')).toHaveTextContent('Mitte');
    expect(screen.getByTestId('zone-info-card')).toHaveAttribute('data-placement', placement);
  });

  it('shows a zone profile image and closes the zone information with the close button', () => {
    render(<BochumMap {...defaultProps} />);
    const mitteLayer = registeredLayers.find(
      (entry) => entry.feature.properties.zoneId === 'mitte'
    )?.layer;

    expect(mitteLayer).toBeDefined();

    const clickHandler = (mitteLayer!.on as any)._events.click;

    act(() => {
      clickHandler({
        originalEvent: {
          stopPropagation: vi.fn()
        },
        containerPoint: { x: 500, y: 120 }
      });
    });

    const profileImage = screen.getByRole('img', { name: 'Profilbild Mitte' });
    expect(profileImage).toHaveAttribute('src', '/photos/Innenstadt.png');
    expect(profileImage).toHaveClass('zone-profile-image');

    const closeButton = screen.getByRole('button', { name: 'Zone-Information schliessen' });
    expect(closeButton).toHaveTextContent('×');
    expect(closeButton).not.toHaveTextContent('(x)');
    expect(closeButton).toHaveClass('zone-info-card__close');

    fireEvent.click(closeButton);

    expect(screen.queryByTestId('zone-info-card')).not.toBeInTheDocument();
  });

  it('shows a district profile image for the new borough zones', () => {
    render(<BochumMap {...defaultProps} />);
    const suedLayer = registeredLayers.find(
      (entry) => entry.feature.properties.zoneId === 'sued'
    )?.layer;

    expect(suedLayer).toBeDefined();

    const clickHandler = (suedLayer!.on as any)._events.click;

    act(() => {
      clickHandler({
        originalEvent: {
          stopPropagation: vi.fn()
        },
        containerPoint: { x: 500, y: 120 }
      });
    });

    const profileImage = screen.getByRole('img', { name: 'Profilbild Süd' });
    expect(profileImage).toHaveAttribute('src', '/photos/Querenburg.png');
    expect(screen.queryByTestId('zone-photo-fallback')).not.toBeInTheDocument();
  });

  it('highlights the zone in green if feedback status is allowed', () => {
    const feedback = {
      zoneId: 'mitte' as const,
      status: 'allowed' as const,
      message: 'Zone permits this asset type'
    };
    render(<BochumMap {...defaultProps} zoneFeedback={feedback} />);
    
    const styleFn = lastGeoJsonProps.style;
    const mitteFeature = registeredLayers.find(
      (l) => l.feature.properties.zoneId === 'mitte'
    )?.feature;
    
    expect(mitteFeature).toBeDefined();
    const style = styleFn(mitteFeature);
    expect(style.color).toBe('#3BB273');
    expect(style.fillColor).toBe('#3BB273');
  });

  it('highlights the zone in red if feedback status is blocked', () => {
    const feedback = {
      zoneId: 'wattenscheid' as const,
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
    expect(style.color).toBe('#F06A6A');
    expect(style.fillColor).toBe('#F06A6A');
  });

  it('handles map click by clearing selection without dispatching a drop', () => {
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
    expect(onDropAsset).not.toHaveBeenCalled();
  });

  it('translates pointer drag positions and drops into map lat/lng coordinates', () => {
    const onDragPosition = vi.fn();
    const onDropAsset = vi.fn();

    render(
      <BochumMap
        {...defaultProps}
        placementDrag={{ itemType: 'solar', clientX: 100, clientY: 100 }}
        onDragPosition={onDragPosition}
        onDropAsset={onDropAsset}
      />
    );

    expect(mockWindowEvents.pointermove).toBeDefined();
    expect(mockWindowEvents.pointerup).toBeDefined();

    const pointerEvent = {
      clientX: 220,
      clientY: 480
    } as PointerEvent;

    mockWindowEvents.pointermove(pointerEvent);
    expect(onDragPosition).toHaveBeenCalledWith({ lat: 51.48, lng: 7.22 });

    mockWindowEvents.pointerup(pointerEvent);
    expect(onDropAsset).toHaveBeenCalledWith({ lat: 51.48, lng: 7.22 });
  });

  it('clears placement feedback when pointer drag leaves the map container', () => {
    const onDragLeave = vi.fn();

    render(
      <BochumMap
        {...defaultProps}
        placementDrag={{ itemType: 'solar', clientX: 100, clientY: 100 }}
        onDragLeave={onDragLeave}
      />
    );

    mockWindowEvents.pointermove({ clientX: 1200, clientY: 1200 } as PointerEvent);

    expect(onDragLeave).toHaveBeenCalled();
  });

  it('reports an outside drop when pointer is released beyond the map container', () => {
    const onDragLeave = vi.fn();
    const onDropOutside = vi.fn();
    const onDropAsset = vi.fn();

    render(
      <BochumMap
        {...defaultProps}
        placementDrag={{ itemType: 'solar', clientX: 100, clientY: 100 }}
        onDragLeave={onDragLeave}
        onDropOutside={onDropOutside}
        onDropAsset={onDropAsset}
      />
    );

    mockWindowEvents.pointerup({ clientX: 1200, clientY: 1200 } as PointerEvent);

    expect(onDropOutside).toHaveBeenCalled();
    expect(onDropAsset).not.toHaveBeenCalled();
    expect(onDragLeave).not.toHaveBeenCalled();
  });
});
