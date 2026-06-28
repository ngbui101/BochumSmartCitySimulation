import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../src/sidebar/Sidebar';
import type { GameKpis } from '../../src/types/game';
import type { WeatherForecastMonth } from '../../src/types/weather';
import type { PlayerAsset } from '../../src/types/assets';

describe('Sidebar component', () => {
  const mockKpis: GameKpis = {
    energyAutarky: 50,
    citizenSatisfaction: 60,
    supplySecurity: 70,
  };

  const mockForecast: WeatherForecastMonth[] = [
    { monthIndex: 0, monthOfYear: 0, weatherType: 'sunny', confidence: 'high' },
    { monthIndex: 1, monthOfYear: 1, weatherType: 'mixed', confidence: 'medium' },
    { monthIndex: 2, monthOfYear: 2, weatherType: 'cloudy', confidence: 'low' },
  ];

  const mockAsset: PlayerAsset = {
    id: 'solar-p1',
    itemType: 'solar',
    zoneId: 'innenstadt',
    position: { lat: 51.48, lng: 7.21 },
    status: 'active',
    placedMonthIndex: 0,
    activeFromMonthIndex: 1,
    purchasePrice: 1200000,
  };

  it('renders the header with correct title and formatted month/year', () => {
    const { rerender } = render(
      <Sidebar
        budget={15000000}
        currentMonthIndex={0} // Month 1 => Year 1, Month 1
        kpis={mockKpis}
        forecast={mockForecast}
      />
    );

    expect(screen.getByText('Bochum Smart City')).toBeInTheDocument();
    expect(screen.getByTestId('month-display')).toHaveTextContent('Monat 1 / 60 (Jahr 1, Monat 1)');

    rerender(
      <Sidebar
        budget={15000000}
        currentMonthIndex={13} // Month 14 => Year 2, Month 2
        kpis={mockKpis}
        forecast={mockForecast}
      />
    );

    expect(screen.getByTestId('month-display')).toHaveTextContent('Monat 14 / 60 (Jahr 2, Monat 2)');
  });

  it('renders sub-components correctly: KpiDashboard, WeatherForecast, BuyableItemList, and AssetDetailsPanel placeholder', () => {
    render(
      <Sidebar
        budget={8000000}
        currentMonthIndex={5}
        kpis={mockKpis}
        forecast={mockForecast}
        selectedAsset={undefined}
      />
    );

    // KpiDashboard components (Budget and KPIs)
    expect(screen.getByTestId('budget-value')).toHaveTextContent('8.000.000 Euro');
    expect(screen.getByText('Energieautarkie')).toBeInTheDocument();

    // WeatherForecast components
    expect(screen.getByText('Wetterprognose')).toBeInTheDocument();
    expect(screen.getAllByTestId('weather-card')).toHaveLength(3);

    // BuyableItemList components
    expect(screen.getByText('Bauoptionen')).toBeInTheDocument();
    expect(screen.getByTestId('buyable-item-solar')).toBeInTheDocument();

    // AssetDetailsPanel placeholder (since selectedAsset is undefined)
    expect(screen.getByText(/Wählen Sie ein Gebäude oder eine Anlage/i)).toBeInTheDocument();
  });

  it('renders selected asset details in AssetDetailsPanel instead of placeholder', () => {
    render(
      <Sidebar
        budget={8000000}
        currentMonthIndex={5}
        kpis={mockKpis}
        forecast={mockForecast}
        selectedAsset={mockAsset}
      />
    );

    // Should render detail panel instead of placeholder
    expect(screen.queryByText(/Wählen Sie ein Gebäude oder eine Anlage/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('asset-title')).toHaveTextContent('Solaranlage');
    expect(screen.getByTestId('asset-zone')).toHaveTextContent('Innenstadt');
  });
});
