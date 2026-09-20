import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Sidebar } from '../../src/sidebar/Sidebar';
import type { GameKpis, SubsidyState } from '../../src/types/game';
import type { WeatherForecastMonth } from '../../src/types/weather';
import type { PlayerAsset } from '../../src/types/assets';
import type { EnergyStatusProps } from '../../src/sidebar/KpiDashboard';

describe('Sidebar component', () => {
  const mockKpis: GameKpis = {
    energyAutarky: 50,
    citizenSatisfaction: 60,
    supplySecurity: 70,
  };

  const mockForecast: WeatherForecastMonth[] = [
    { monthIndex: 0, monthOfYear: 0, weatherType: 'sunny', confidence: 'high', solarFactor: 1.2, windFactor: 0.85 },
    { monthIndex: 1, monthOfYear: 1, weatherType: 'mixed', confidence: 'medium', solarFactor: 0.85, windFactor: 1.05 },
    { monthIndex: 2, monthOfYear: 2, weatherType: 'cloudy', confidence: 'low', solarFactor: 0.8, windFactor: 1.1 },
  ];

  const mockEnergyStatus: EnergyStatusProps = {
    energySaldo: -40,
    importCost: 2400000,
    storedEnergy: 0,
    storageCapacity: 0,
    isGracePeriod: false,
    netMonthlyDelta: -2000000,
    revenueFromSales: 3800000
  };

  const mockAsset: PlayerAsset = {
    id: 'solar-p1',
    itemType: 'solar',
    zoneId: 'mitte',
    position: { lat: 51.48, lng: 7.21 },
    status: 'active',
    placedMonthIndex: 0,
    activeFromMonthIndex: 1,
    purchasePrice: 1200000,
  };

  const mockSubsidies: SubsidyState = {
    solar: { level: 1, privateCapacity: 4 },
    storage: { level: 0, privateCapacity: 0 }
  };

  it('renders the header with correct title and formatted month/year', () => {
    const { rerender } = render(
      <Sidebar
        budget={15000000}
        currentMonthIndex={0} // Month 1 => Year 1, Month 1
        kpis={mockKpis}
        energyStatus={mockEnergyStatus}
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
        energyStatus={mockEnergyStatus}
        forecast={mockForecast}
      />
    );

    expect(screen.getByTestId('month-display')).toHaveTextContent('Monat 14 / 60 (Jahr 2, Monat 2)');
  });

  it('renders sub-components correctly: KpiDashboard, WeatherForecast, and BuyableItemList', () => {
    const handleSetSubsidyLevel = vi.fn();

    render(
      <Sidebar
        budget={8000000}
        currentMonthIndex={5}
        kpis={mockKpis}
        energyStatus={mockEnergyStatus}
        forecast={mockForecast}
        subsidies={mockSubsidies}
        subsidyCosts={250000}
        privateSolarProduction={2.2}
        privateStorageDischarge={0}
        onSetSubsidyLevel={handleSetSubsidyLevel}
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

    expect(screen.getByTestId('subsidy-panel')).toHaveTextContent('Foerderung');
    expect(screen.getByTestId('subsidy-panel')).toHaveTextContent('250.000');

    fireEvent.click(screen.getByRole('button', { name: /Speicherförderung Stufe 1/i }));
    expect(handleSetSubsidyLevel).toHaveBeenCalledWith('storage', 1);
  });
});
