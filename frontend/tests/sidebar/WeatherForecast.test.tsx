import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherForecast } from '../../src/sidebar/WeatherForecast';
import type { WeatherForecastMonth } from '../../src/types/weather';

describe('WeatherForecast component', () => {
  const mockForecast: WeatherForecastMonth[] = [
    { monthIndex: 0, monthOfYear: 0, weatherType: 'windy', confidence: 'high' },
    { monthIndex: 1, monthOfYear: 1, weatherType: 'mixed', confidence: 'medium' },
    { monthIndex: 2, monthOfYear: 4, weatherType: 'sunny', confidence: 'low' },
    { monthIndex: 3, monthOfYear: 5, weatherType: 'stormy', confidence: 'high' },
  ];

  it('renders exactly the first three months of forecast as cards', () => {
    render(<WeatherForecast forecast={mockForecast} />);

    const cards = screen.getAllByTestId('weather-card');
    expect(cards).toHaveLength(3);
  });

  it('renders correct month names, icons, types and confidence levels', () => {
    render(<WeatherForecast forecast={mockForecast} />);

    // Card 1: monthOfYear = 0 (Januar), weatherType = windy, confidence = high
    expect(screen.getByText('Januar')).toBeInTheDocument();
    expect(screen.getByTestId('icon-windy')).toBeInTheDocument();
    expect(screen.getByText('Windig')).toBeInTheDocument();
    expect(screen.getByText('Hoch')).toBeInTheDocument();

    // Card 2: monthOfYear = 1 (Februar), weatherType = mixed, confidence = medium
    expect(screen.getByText('Februar')).toBeInTheDocument();
    expect(screen.getByTestId('icon-mixed')).toBeInTheDocument();
    expect(screen.getByText('Wechselhaft')).toBeInTheDocument();
    expect(screen.getByText('Mittel')).toBeInTheDocument();

    // Card 3: monthOfYear = 4 (Mai), weatherType = sunny, confidence = low
    expect(screen.getByText('Mai')).toBeInTheDocument();
    expect(screen.getByTestId('icon-sunny')).toBeInTheDocument();
    expect(screen.getByText('Sonnig')).toBeInTheDocument();
    expect(screen.getByText('Niedrig')).toBeInTheDocument();

    // Should not render the 4th card (Juni, stormy)
    expect(screen.queryByText('Juni')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-stormy')).not.toBeInTheDocument();
  });
});
