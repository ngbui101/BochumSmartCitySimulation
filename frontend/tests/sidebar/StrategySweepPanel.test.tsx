import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StrategySweepPanel } from '../../src/sidebar/StrategySweepPanel';

describe('StrategySweepPanel', () => {
  it('keeps the analysis collapsed and reveals the complete sweep chart on demand', () => {
    render(<StrategySweepPanel />);

    expect(screen.queryByRole('img', { name: /Strategie-Sweep/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Strategie-Sweep/i }));

    expect(screen.getByRole('img', { name: /Strategie-Sweep/i })).toHaveAttribute(
      'src',
      '/strategy-sweep.png'
    );
    expect(screen.getByText(/135–200 %/i)).toBeInTheDocument();
  });
});
