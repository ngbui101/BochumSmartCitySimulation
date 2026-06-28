import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssetDetailsPanel } from '../../src/sidebar/AssetDetailsPanel';
import type { PlayerAsset, ExistingAsset } from '../../src/types/assets';

describe('AssetDetailsPanel component', () => {
  const mockSolarAsset: PlayerAsset = {
    id: 'solar-1',
    itemType: 'solar',
    zoneId: 'innenstadt',
    position: { lat: 51.48, lng: 7.21 },
    status: 'active',
    placedMonthIndex: 0,
    activeFromMonthIndex: 1,
    purchasePrice: 1200000,
  };

  const mockConstructionWindAsset: PlayerAsset = {
    id: 'wind-1',
    itemType: 'wind',
    zoneId: 'wattenscheid',
    position: { lat: 51.49, lng: 7.22 },
    status: 'under_construction',
    placedMonthIndex: 2,
    activeFromMonthIndex: 3,
    purchasePrice: 2800000,
  };

  const mockStorageAsset: PlayerAsset = {
    id: 'storage-1',
    itemType: 'storage',
    zoneId: 'querenburg',
    position: { lat: 51.47, lng: 7.23 },
    status: 'active',
    placedMonthIndex: 1,
    activeFromMonthIndex: 2,
    purchasePrice: 1700000,
  };

  const mockExistingAsset: ExistingAsset = {
    id: 'existing-1',
    name: 'Heizkraftwerk Bochum',
    assetTypeLabel: 'Kohlekraftwerk',
    zoneId: 'langendreer',
    position: { lat: 51.46, lng: 7.24 },
    statusLabel: 'Bestand',
    roleDescription: 'Generiert Strom und Fernwärme für den Stadtteil.',
    modifiable: false,
    dataConfidence: 'verified-real-data'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when no asset is selected', () => {
    const { container } = render(<AssetDetailsPanel selectedAsset={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders details and "Verkaufen" button for an active player solar asset', () => {
    const onSell = vi.fn();
    render(<AssetDetailsPanel selectedAsset={mockSolarAsset} onSell={onSell} />);
    
    // Label/Type (Solaranlage)
    expect(screen.getByTestId('asset-title')).toHaveTextContent('Solaranlage');
    expect(screen.getByTestId('asset-type')).toHaveTextContent('Solaranlage');
    
    // Zone (Innenstadt)
    expect(screen.getByTestId('asset-zone')).toHaveTextContent('Innenstadt');
    
    // Status (Aktiv (active))
    expect(screen.getByTestId('asset-status')).toHaveTextContent(/active/i);
    
    // Production capacity (7 MW)
    expect(screen.getByTestId('asset-production-capacity')).toHaveTextContent('7 MW');
    expect(screen.queryByTestId('asset-storage-capacity')).not.toBeInTheDocument();
    
    // Operating costs (35.000 €/Monat)
    expect(screen.getByTestId('asset-operating-costs')).toHaveTextContent('35.000');
    
    // Sell value (1.200.000 * 0.6 = 720.000 €)
    expect(screen.getByTestId('asset-sell-value')).toHaveTextContent('720.000');

    // Sell button triggers callback
    const sellButton = screen.getByRole('button', { name: /Verkaufen/i });
    expect(sellButton).toBeInTheDocument();
    
    fireEvent.click(sellButton);
    expect(onSell).toHaveBeenCalledWith('solar-1');
    expect(screen.queryByText(/Keine Änderung möglich/i)).not.toBeInTheDocument();
  });

  it('renders construction status correctly for player wind asset under construction', () => {
    render(<AssetDetailsPanel selectedAsset={mockConstructionWindAsset} />);
    
    expect(screen.getByTestId('asset-title')).toHaveTextContent('Windmühle');
    expect(screen.getByTestId('asset-status')).toHaveTextContent(/under_construction/i);
    expect(screen.getByTestId('asset-production-capacity')).toHaveTextContent('14 MW');
    
    // Operating costs (80.000 €/Monat)
    expect(screen.getByTestId('asset-operating-costs')).toHaveTextContent('80.000');
    
    // Sell value (2.800.000 * 0.6 = 1.680.000 €)
    expect(screen.getByTestId('asset-sell-value')).toHaveTextContent('1.680.000');
  });

  it('renders storage capacity correctly for player energy storage asset', () => {
    render(<AssetDetailsPanel selectedAsset={mockStorageAsset} />);
    
    expect(screen.getByTestId('asset-title')).toHaveTextContent('Energiespeicher');
    expect(screen.queryByTestId('asset-production-capacity')).not.toBeInTheDocument();
    expect(screen.getByTestId('asset-storage-capacity')).toHaveTextContent('10 MWh');
  });

  it('renders details, role description, and read-only notice for existing assets, hiding sell button', () => {
    const onSell = vi.fn();
    render(<AssetDetailsPanel selectedAsset={mockExistingAsset} onSell={onSell} />);
    
    // Name and Type
    expect(screen.getByTestId('asset-title')).toHaveTextContent('Heizkraftwerk Bochum');
    expect(screen.getByTestId('asset-type')).toHaveTextContent('Kohlekraftwerk');
    
    // Zone
    expect(screen.getByTestId('asset-zone')).toHaveTextContent('Langendreer');
    
    // Status
    expect(screen.getByTestId('asset-status')).toHaveTextContent('Bestand');
    
    // Role description
    expect(screen.getByTestId('asset-role-description')).toHaveTextContent('Generiert Strom und Fernwärme');
    
    // Read-only notice
    expect(screen.getByText('Keine Änderung möglich (Bestandsanlage)')).toBeInTheDocument();
    
    // No sell button
    expect(screen.queryByRole('button', { name: /Verkaufen/i })).not.toBeInTheDocument();
  });
});
