import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { BuyableItemList } from '../../src/sidebar/BuyableItemList';

describe('BuyableItemList component', () => {
  it('renders all buyable items (Solar, Wind, Storage) when budget is sufficient', () => {
    render(<BuyableItemList budget={5000000} />);

    expect(screen.getByText('Solaranlage')).toBeInTheDocument();
    expect(screen.getByText('Windmühle')).toBeInTheDocument();
    expect(screen.getByText('Energiespeicher')).toBeInTheDocument();

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(solarCard).not.toHaveClass('disabled');
    expect(windCard).not.toHaveClass('disabled');
    expect(storageCard).not.toHaveClass('disabled');

    expect(solarCard).not.toHaveAttribute('draggable');
    expect(windCard).not.toHaveAttribute('draggable');
    expect(storageCard).not.toHaveAttribute('draggable');
  });

  it('correctly disables items costing more than the available budget', () => {
    // Budget is 1,500,000
    // Solaranlage cost: 1,200,000 (enabled)
    // Energiespeicher cost: 1,700,000 (disabled)
    // Windmühle cost: 2,800,000 (disabled)
    render(<BuyableItemList budget={1500000} />);

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(solarCard).not.toHaveClass('disabled');
    expect(windCard).toHaveClass('disabled');
    expect(storageCard).toHaveClass('disabled');

    expect(solarCard).not.toHaveAttribute('draggable');
    expect(windCard).not.toHaveAttribute('draggable');
    expect(storageCard).not.toHaveAttribute('draggable');
  });

  it('displays the correct tooltip text when hovering over disabled items', () => {
    render(<BuyableItemList budget={1500000} />);

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
    expect(solarCard).not.toHaveAttribute('title');
  });

  it('triggers onPointerDragStart only for enabled/active items', () => {
    const onPointerDragStart = vi.fn();
    render(<BuyableItemList budget={1500000} onPointerDragStart={onPointerDragStart} />);

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');

    const solarPointerEvent = createEvent.pointerDown(solarCard);
    Object.defineProperty(solarPointerEvent, 'clientX', { value: 20 });
    Object.defineProperty(solarPointerEvent, 'clientY', { value: 30 });

    fireEvent(solarCard, solarPointerEvent);
    expect(onPointerDragStart).toHaveBeenCalledWith('solar', { clientX: 20, clientY: 30 });

    onPointerDragStart.mockClear();
    fireEvent.pointerDown(windCard);
    expect(onPointerDragStart).not.toHaveBeenCalled();
  });
});
