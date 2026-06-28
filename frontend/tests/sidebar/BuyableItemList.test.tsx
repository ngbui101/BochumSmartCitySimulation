import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { BuyableItemList } from '../../src/sidebar/BuyableItemList';

describe('BuyableItemList component', () => {
  const defaultProps = {
    budget: 5000000,
    selectedItemType: null,
    onSelectItemType: vi.fn(),
    onPointerDragStart: vi.fn(),
  };

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

  it('triggers onPointerDragStart and onSelectItemType only for enabled/active items', () => {
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
    const windCard = screen.getByTestId('buyable-item-wind');

    const solarPointerEvent = createEvent.pointerDown(solarCard);
    Object.defineProperty(solarPointerEvent, 'clientX', { value: 20 });
    Object.defineProperty(solarPointerEvent, 'clientY', { value: 30 });

    fireEvent(solarCard, solarPointerEvent);
    expect(onSelectItemType).toHaveBeenCalledWith('solar');
    expect(onPointerDragStart).toHaveBeenCalledWith('solar', { clientX: 20, clientY: 30 });

    onPointerDragStart.mockClear();
    onSelectItemType.mockClear();

    fireEvent.pointerDown(windCard);
    expect(onSelectItemType).toHaveBeenCalledWith('wind'); // Clicking disabled item still selects to show info
    expect(onPointerDragStart).not.toHaveBeenCalled(); // But does not trigger placement drag!
  });
});
