import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetMarkers } from '../../src/map/AssetMarkers';
import type { PlayerAsset, ExistingAsset, PrivateAsset } from '../../src/types/assets';

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
    },
    Popup: ({ children }: any) => {
      return <div data-testid="mock-popup">{children}</div>;
    }
  };
});

describe('AssetMarkers component', () => {
  const mockPlayerAssets: PlayerAsset[] = [
    {
      id: 'solar-1',
      itemType: 'solar',
      zoneId: 'mitte',
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
      zoneId: 'sued',
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
      zoneId: 'ost',
      position: { lat: 51.46, lng: 7.24 },
      statusLabel: 'Bestand',
      roleDescription: 'Erzeugt Strom',
      modifiable: false,
      dataConfidence: 'verified-real-data'
    }
  ];

  const mockPrivateAssets: PrivateAsset[] = [
    {
      id: 'private-1',
      name: 'Private Solaranlage #1',
      itemType: 'solar',
      assetTypeLabel: 'Solaranlage (privat)',
      zoneId: 'mitte',
      position: { lat: 51.481, lng: 7.211 },
      statusLabel: 'Privat aktiv',
      roleDescription: 'Bürgeranlage entlastet das Netz.',
      modifiable: false,
      sellable: false,
      operatingCost: 0,
      gridReliefCapacity: 2,
      ownership: 'private',
      dataConfidence: 'mvp-placeholder'
    }
  ];

  const defaultProps = {
    playerAssets: mockPlayerAssets,
    existingAssets: mockExistingAssets,
    privateAssets: mockPrivateAssets,
    selectedAssetId: undefined,
    onSelectAsset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Marker for every player and existing asset', () => {
    render(<AssetMarkers {...defaultProps} />);
    const markers = screen.getAllByTestId('mock-marker');
    expect(markers.length).toBe(mockPlayerAssets.length + mockExistingAssets.length + mockPrivateAssets.length);
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
    expect(solarHtml).toContain('asset-marker--solar');
    expect(solarHtml).toContain('/icons/Solaranlage.png');
    expect(solarHtml).toContain('alt="Solaranlage"');

    const windMarker = getByAttribute('data-id', 'wind-1');
    const windHtml = windMarker.getAttribute('data-icon-html') || '';
    expect(windHtml).toContain('asset-marker--wind');
    expect(windHtml).toContain('asset-marker--construction');
    expect(windHtml).toContain('/icons/Windkraftanlage_build.png');
    expect(windHtml).toContain('alt="Kleinwindanlage im Bau"');

    const storageMarker = getByAttribute('data-id', 'storage-1');
    const storageHtml = storageMarker.getAttribute('data-icon-html') || '';
    expect(storageHtml).toContain('asset-marker--storage');
    expect(storageHtml).toContain('/icons/Energiespeicher.png');
    expect(storageHtml).toContain('alt="Energiespeicher"');
  });

  it('correctly renders icon for existing assets', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const existingMarker = getByAttribute('data-id', 'existing-1');
    const existingHtml = existingMarker.getAttribute('data-icon-html') || '';
    expect(existingHtml).toContain('asset-marker--existing');
    expect(existingHtml).toContain('#60736A');
  });

  it('renders private assets with a distinct private marker style', () => {
    render(<AssetMarkers {...defaultProps} />);
    const privateMarker = getByAttribute('data-id', 'private-1');
    const privateHtml = privateMarker.getAttribute('data-icon-html') || '';

    expect(privateHtml).toContain('asset-marker--private-solar');
    expect(privateHtml).toContain('Solaranlage.png');
    expect(privateHtml).toContain('background-color:#F2D6A7');
  });

  it('uses build icon and construction badge overlay for assets under construction', () => {
    render(<AssetMarkers {...defaultProps} />);
    
    const activeSolarMarker = getByAttribute('data-id', 'solar-1');
    const activeSolarHtml = activeSolarMarker.getAttribute('data-icon-html') || '';
    expect(activeSolarHtml).not.toContain('/icons/Solaranlage_build.png');
    expect(activeSolarHtml).not.toContain('construction-badge-overlay');

    const underConstructionMarker = getByAttribute('data-id', 'wind-1');
    const constructionHtml = underConstructionMarker.getAttribute('data-icon-html') || '';
    expect(constructionHtml).toContain('/icons/Windkraftanlage_build.png');
    expect(constructionHtml).toContain('construction-badge-overlay');
  });

  it('uses selected icon and renders selection ring when selectedAssetId matches active asset id', () => {
    render(<AssetMarkers {...defaultProps} selectedAssetId="solar-1" />);
    
    const selectedMarker = getByAttribute('data-id', 'solar-1');
    const selectedHtml = selectedMarker.getAttribute('data-icon-html') || '';
    expect(selectedHtml).toContain('/icons/Solaranlage_selected.png');
    expect(selectedHtml).toContain('alt="Ausgewählte Solaranlage"');
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
