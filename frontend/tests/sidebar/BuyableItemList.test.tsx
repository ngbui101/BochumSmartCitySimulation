import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BuyableItemList } from '../../src/sidebar/BuyableItemList';

describe('BuyableItemList component', () => {
  const defaultProps = {
    budget: 5000000,
    selectedItemType: null,
    onSelectItemType: vi.fn(),
    onPointerDragStart: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all buyable items (Solar, Wind, Storage) in a grid layout', () => {
    render(<BuyableItemList {...defaultProps} />);

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(solarCard).toHaveAttribute('title', 'Solaranlage');
    expect(windCard).toHaveAttribute('title', 'Windmühle');
    expect(storageCard).toHaveAttribute('title', 'Energiespeicher');

    expect(solarCard).not.toHaveClass('disabled');
    expect(windCard).not.toHaveClass('disabled');
    expect(storageCard).not.toHaveClass('disabled');
  });

  it('correctly disables items costing more than the available budget', () => {
    render(<BuyableItemList {...defaultProps} budget={1500000} />);

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(solarCard).not.toHaveClass('disabled');
    expect(windCard).toHaveClass('disabled');
    expect(storageCard).toHaveClass('disabled');
  });

  it('displays the correct tooltip text when hovering over disabled items', () => {
    render(<BuyableItemList {...defaultProps} budget={1500000} />);

    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(windCard).toHaveAttribute(
      'title',
      'Nicht genügend Budget (Benötigt: 2.800.000 Euro, Vorhanden: 1.500.000 Euro)'
    );
    expect(storageCard).toHaveAttribute(
      'title',
      'Nicht genügend Budget (Benötigt: 1.700.000 Euro, Vorhanden: 1.500.000 Euro)'
    );

    const solarCard = screen.getByTestId('buyable-item-solar');
    expect(solarCard).toHaveAttribute('title', 'Solaranlage');
  });

  it('handles quick clicks (ignored), double clicks (selects info), and hold-delay (dragging)', () => {
    const onPointerDragStart = vi.fn();
    const onSelectItemType = vi.fn();
    render(
      <BuyableItemList
        {...defaultProps}
        budget={1500000}
        onPointerDragStart={onPointerDragStart}
        onSelectItemType={onSelectItemType}
      />
    );

    const solarCard = screen.getByTestId('buyable-item-solar');

    // 1. Quick single click: down and up immediately (should NOT call onSelectItemType)
    fireEvent.pointerDown(solarCard);
    fireEvent.pointerUp(solarCard);

    expect(onSelectItemType).not.toHaveBeenCalled();
    expect(onPointerDragStart).not.toHaveBeenCalled();

    // 2. Double click: triggers details popover
    fireEvent.doubleClick(solarCard);
    expect(onSelectItemType).toHaveBeenCalledWith('solar');
    expect(onPointerDragStart).not.toHaveBeenCalled();

    onSelectItemType.mockClear();
    onPointerDragStart.mockClear();

    // 3. Click and hold: down and advance time by 200ms
    fireEvent.pointerDown(solarCard);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onPointerDragStart).toHaveBeenCalledWith('solar', expect.any(Object));
    expect(onSelectItemType).not.toHaveBeenCalled(); // No selection trigger when drag starts
  });
});
