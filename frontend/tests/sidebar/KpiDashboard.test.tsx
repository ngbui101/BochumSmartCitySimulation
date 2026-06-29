import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiDashboard } from '../../src/sidebar/KpiDashboard';
import type { GameKpis } from '../../src/types/game';
import type { EnergyStatusProps } from '../../src/sidebar/KpiDashboard';

const mockEnergyStatus: EnergyStatusProps = {
  energySaldo: -30,
  importCost: 1800000,
  storedEnergy: 0,
  storageCapacity: 0,
  isGracePeriod: false,
  netMonthlyDelta: -1900000,
  revenueFromSales: 3800000
};

describe('KpiDashboard component', () => {
  const mockKpis: GameKpis = {
    energyAutarky: 42,
    citizenSatisfaction: 73,
    supplySecurity: 88,
  };

  it('renders localized budget correctly', () => {
    render(<KpiDashboard budget={18000000} kpis={mockKpis} energyStatus={mockEnergyStatus} />);

    const budgetDisplay = screen.getByTestId('budget-value');
    expect(budgetDisplay).toHaveTextContent('18.000.000 Euro');
  });

  it('renders all three KPI bars with correct labels, values and percentage units', () => {
    render(<KpiDashboard budget={10000000} kpis={mockKpis} energyStatus={mockEnergyStatus} />);

    expect(screen.getByText('Energieautarkie')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    expect(screen.getByText('Bürgerzufriedenheit')).toBeInTheDocument();
    expect(screen.getByText('73%')).toBeInTheDocument();

    expect(screen.getByText('Versorgungssicherheit')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('does not render budgetEfficiency KPI', () => {
    render(<KpiDashboard budget={10000000} kpis={mockKpis} energyStatus={mockEnergyStatus} />);

    expect(screen.queryByText(/budgetEfficiency/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Budgeteffizienz/i)).not.toBeInTheDocument();
  });

  it('renders energy status row', () => {
    render(<KpiDashboard budget={10000000} kpis={mockKpis} energyStatus={mockEnergyStatus} />);

    expect(screen.getByTestId('energy-status-row')).toBeInTheDocument();
  });

  it('renders budget delta correctly', () => {
    const customStatus = { ...mockEnergyStatus, netMonthlyDelta: 1200000, revenueFromSales: 3800000 };
    render(<KpiDashboard budget={18000000} kpis={mockKpis} energyStatus={customStatus} />);
    expect(screen.getByText(/\+1\.200\.000/)).toBeInTheDocument();
  });
});
