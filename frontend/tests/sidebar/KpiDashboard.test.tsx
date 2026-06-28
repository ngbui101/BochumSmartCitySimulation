import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiDashboard } from '../../src/sidebar/KpiDashboard';
import type { GameKpis } from '../../src/types/game';

describe('KpiDashboard component', () => {
  const mockKpis: GameKpis = {
    energyAutarky: 42,
    citizenSatisfaction: 73,
    supplySecurity: 88,
  };

  it('renders localized budget correctly', () => {
    render(<KpiDashboard budget={18000000} kpis={mockKpis} />);
    
    // Check for de-DE localized budget: "18.000.000 Euro"
    const budgetDisplay = screen.getByTestId('budget-value');
    expect(budgetDisplay).toHaveTextContent('18.000.000 Euro');
  });

  it('renders all three KPI bars with correct labels, values and percentage units', () => {
    render(<KpiDashboard budget={10000000} kpis={mockKpis} />);

    // Energieautarkie
    expect(screen.getByText('Energieautarkie')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();

    // Bürgerzufriedenheit
    expect(screen.getByText('Bürgerzufriedenheit')).toBeInTheDocument();
    expect(screen.getByText('73%')).toBeInTheDocument();

    // Versorgungssicherheit
    expect(screen.getByText('Versorgungssicherheit')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
  });

  it('does not render budgetEfficiency KPI', () => {
    render(<KpiDashboard budget={10000000} kpis={mockKpis} />);
    
    expect(screen.queryByText(/budgetEfficiency/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Budgeteffizienz/i)).not.toBeInTheDocument();
  });
});
