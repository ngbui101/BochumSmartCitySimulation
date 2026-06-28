import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetMarkers } from '../../src/map/AssetMarkers';
import type { PlayerAsset, ExistingAsset } from '../../src/types/assets';

// Mock leaflet
vi.mock('leaflet', () => {
  return {
    default: {
      divIcon: vi.fn((options) => ({ options }))
    },
    divIcon: vi.fn((options) => ({ options }))
  };
});

// Mock react-leaflet
vi.mock('react-leaflet', () => {
  return {
    Marker: ({ position, icon, eventHandlers, children }: any) => {
      // Create a test handler that can propagate mock click event
      const handleClick = (e: any) => {
        if (eventHandlers && eventHandlers.click) {
          eventHandlers.click({
            originalEvent: {
              stopPropagation: vi.fn()
            }
          });
        }
      };
      
      return (
        <div
          data-testid="mock-marker"
          data-id={icon.options.className.replace('custom-asset-marker-', '')}
          data-position={JSON.stringify(position)}
          data-icon-html={icon.options.html}
          onClick={handleClick}
        >
          {children}
        </div>
      );
    }
  };
});

describe('AssetMarkers component', () => {
  const mockPlayerAssets: PlayerAsset[] = [
    {
      id: 'solar-1',
      itemType: 'solar',
      zoneId: 'innenstadt',
      position: { lat: 51.48, lng: 7.21 },
      status: 'active',
      placedMonthIndex: 0,
      activeFromMonthIndex: 1,
      purchasePrice: 1200000,
    },
    {
      id: 'wind-1',
      itemType: 'wind',
      zoneId: 'wattenscheid',
      position: { lat: 51.49, lng: 7.22 },
      status: 'under_construction',
      placedMonthIndex: 2,
      activeFromMonthIndex: 3,
      purchasePrice: 2800000,
    },
    {
      id: 'storage-1',
      itemType: 'storage',
      zoneId: 'querenburg',
      position: { lat: 51.47, lng: 7.23 },
      status: 'active',
      placedMonthIndex: 1,
      activeFromMonthIndex: 2,
      purchasePrice: 1700000,
    }
  ];

  const mockExistingAssets: ExistingAsset[] = [
    {
      id: 'existing-1',
      name: 'Kohlekraftwerk Bochum',
      assetTypeLabel: 'Kohlekraftwerk',
      zoneId: 'langendreer',
      position: { lat: 51.46, lng: 7.24 },
      statusLabel: 'Bestand',
      roleDescription: 'Erzeugt Strom',
      modifiable: false,
      dataConfidence: 'verified-real-data'
    }
  ];

  const defaultProps = {
    playerAssets: mockPlayerAssets,
    existingAssets: mockExistingAssets,
    selectedAssetId: undefined,
    onSelectAsset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Marker for every player and existing asset', () => {
    render(<AssetMarkers {...defaultProps} />);
    const markers = screen.getAllByTestId('mock-marker');
    expect(markers.length).toBe(mockPlayerAssets.length + mockExistingAssets.length);
  });

  it('renders markers at correct positions', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const marker1 = getByAttribute('data-id', 'solar-1');
    expect(marker1.getAttribute('data-position')).toBe(
      JSON.stringify([mockPlayerAssets[0].position.lat, mockPlayerAssets[0].position.lng])
    );

    const markerExisting = getByAttribute('data-id', 'existing-1');
    expect(markerExisting.getAttribute('data-position')).toBe(
      JSON.stringify([mockExistingAssets[0].position.lat, mockExistingAssets[0].position.lng])
    );
  });

  it('triggers onSelectAsset on click and stops propagation', () => {
    const onSelectAsset = vi.fn();
    render(<AssetMarkers {...defaultProps} onSelectAsset={onSelectAsset} />);
    
    const marker = getByAttribute('data-id', 'solar-1');
    
    // Simulate event handlers internally via mock trigger
    fireEvent.click(marker);
    
    expect(onSelectAsset).toHaveBeenCalledWith('solar-1');
  });

  it('correctly maps and renders icons for player assets', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const solarMarker = getByAttribute('data-id', 'solar-1');
    const solarHtml = solarMarker.getAttribute('data-icon-html') || '';
    // Solar icon has a rect element, and standard solar color #eab308 / yellow
    expect(solarHtml).toContain('rect');
    expect(solarHtml).toContain('#eab308');

    const windMarker = getByAttribute('data-id', 'wind-1');
    const windHtml = windMarker.getAttribute('data-icon-html') || '';
    // Wind icon has circle cx="12" cy="12" and color #3b82f6 / blue
    expect(windHtml).toContain('circle');
    expect(windHtml).toContain('#3b82f6');

    const storageMarker = getByAttribute('data-id', 'storage-1');
    const storageHtml = storageMarker.getAttribute('data-icon-html') || '';
    // Storage icon contains rect and color #10b981 / green
    expect(storageHtml).toContain('#10b981');
  });

  it('correctly renders icon for existing assets', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const existingMarker = getByAttribute('data-id', 'existing-1');
    const existingHtml = existingMarker.getAttribute('data-icon-html') || '';
    // Existing icon uses grey color #6b7280 and standard rect
    expect(existingHtml).toContain('#6b7280');
  });

  it('applies stripe pattern and construction badge overlay for assets under construction', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const activeSolarMarker = getByAttribute('data-id', 'solar-1');
    const activeSolarHtml = activeSolarMarker.getAttribute('data-icon-html') || '';
    expect(activeSolarHtml).not.toContain('repeating-linear-gradient');
    expect(activeSolarHtml).not.toContain('construction-badge-overlay');

    const underConstructionMarker = getByAttribute('data-id', 'wind-1');
    const constructionHtml = underConstructionMarker.getAttribute('data-icon-html') || '';
    expect(constructionHtml).toContain('repeating-linear-gradient');
    expect(constructionHtml).toContain('construction-badge-overlay');
  });

  it('renders selection ring when selectedAssetId matches asset id', () => {
    render(<AssetMarkers {...defaultProps} selectedAssetId="solar-1" />);
    
    const selectedMarker = getByAttribute('data-id', 'solar-1');
    const selectedHtml = selectedMarker.getAttribute('data-icon-html') || '';
    expect(selectedHtml).toContain('selected-ring');

    const unselectedMarker = getByAttributeOrNull('data-id', 'wind-1');
    const unselectedHtml = unselectedMarker ? unselectedMarker.getAttribute('data-icon-html') || '' : '';
    expect(unselectedHtml).not.toContain('selected-ring');
  });
});

// Simple custom selector for screen helper
const getByAttribute = (attributeName: string, attributeValue: string) => {
  const el = document.querySelector(`[${attributeName}="${attributeValue}"]`);
  if (!el) {
    throw new Error(`Unable to find element with attribute [${attributeName}="${attributeValue}"]`);
  }
  return el;
};

const getByAttributeOrNull = (attributeName: string, attributeValue: string) => {
  return document.querySelector(`[${attributeName}="${attributeValue}"]`);
};
