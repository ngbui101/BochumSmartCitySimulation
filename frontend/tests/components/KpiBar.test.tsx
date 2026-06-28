import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KpiBar } from '../../src/components/KpiBar';

describe('KpiBar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label, value, unit, and icon correctly', () => {
    const mockIcon = <span data-testid="test-icon">icon</span>;
    render(
      <KpiBar
        label="Test-KPI"
        value={75}
        unit="%"
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Test-KPI')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    
    // Verify progress bar width
    const progressBg = screen.getByText('75%').closest('.kpi-bar-container')?.querySelector('.kpi-progress-bg');
    expect(progressBg).toBeInTheDocument();
    
    const progressFill = progressBg?.querySelector('.kpi-progress-fill');
    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveStyle('width: 75%');
  });

  it('does not render delta indicator initially if delta is not provided or is 0', () => {
    const { rerender } = render(<KpiBar label="Test-KPI" value={75} unit="%" />);
    expect(screen.queryByTestId('kpi-delta-indicator')).not.toBeInTheDocument();

    rerender(<KpiBar label="Test-KPI" value={75} delta={0} unit="%" />);
    expect(screen.queryByTestId('kpi-delta-indicator')).not.toBeInTheDocument();
  });

  it('renders and animates delta indicator when delta changes', () => {
    vi.useFakeTimers();
    
    const { rerender } = render(<KpiBar label="Test-KPI" value={75} delta={5} unit="%" />);
    
    // Should display +5% immediately
    expect(screen.getByTestId('kpi-delta-indicator')).toHaveTextContent('+5%');
    expect(screen.getByTestId('kpi-delta-indicator')).toHaveClass('delta-improve');

    // Advance past the 1500ms duration
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByTestId('kpi-delta-indicator')).not.toBeInTheDocument();

    // Rerender with negative delta
    rerender(<KpiBar label="Test-KPI" value={70} delta={-3} unit="%" />);
    
    // Should display -3% immediately
    expect(screen.getByTestId('kpi-delta-indicator')).toHaveTextContent('-3%');
    expect(screen.getByTestId('kpi-delta-indicator')).toHaveClass('delta-worsen');

    vi.useRealTimers();
  });

  it('replays delta animation on mouse enter', () => {
    vi.useFakeTimers();

    const { container } = render(<KpiBar label="Test-KPI" value={75} delta={5} unit="%" />);
    
    // Finish initial animation
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByTestId('kpi-delta-indicator')).not.toBeInTheDocument();

    // Trigger mouse enter
    const kpiContainer = container.firstChild;
    expect(kpiContainer).toBeInTheDocument();
    
    act(() => {
      fireEvent.mouseEnter(kpiContainer!);
    });

    // Start of hover animation is immediate
    expect(screen.getByTestId('kpi-delta-indicator')).toHaveTextContent('+5%');

    // Finish hover animation
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByTestId('kpi-delta-indicator')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
