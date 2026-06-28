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

    expect(screen.getByRole('img', { name: 'Solaranlage' })).toHaveAttribute(
      'src',
      '/icons/Solaranlage.png'
    );
    expect(screen.getByRole('img', { name: 'Windkraftanlage' })).toHaveAttribute(
      'src',
      '/icons/Windkraftanlage.png'
    );
    expect(screen.getByRole('img', { name: 'Energiespeicher' })).toHaveAttribute(
      'src',
      '/icons/Energiespeicher.png'
    );
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

  it('renders selected item information as an overlay inside the sidebar item list', () => {
    render(<BuyableItemList {...defaultProps} selectedItemType="solar" />);

    const itemList = screen.getByTestId('buyable-item-list');
    const detailsCard = screen.getByTestId('buyable-item-details-card');

    expect(itemList).toContainElement(detailsCard);
    expect(detailsCard).toHaveStyle({
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      zIndex: '1200'
    });
    expect(screen.getByTestId('selected-item-label')).toHaveTextContent('Solaranlage');
    expect(screen.getByTestId('selected-item-cost')).toHaveTextContent('1.200.000');
  });

  it('closes selected item information when clicking outside the item list container', () => {
    const onSelectItemType = vi.fn();
    render(
      <BuyableItemList
        {...defaultProps}
        selectedItemType="solar"
        onSelectItemType={onSelectItemType}
      />
    );

    fireEvent.pointerDown(document.body);

    expect(onSelectItemType).toHaveBeenCalledWith(null);
  });

  it('handles single clicks for info and hold-delay for dragging', () => {
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

    fireEvent.click(solarCard);

    expect(onSelectItemType).toHaveBeenCalledWith('solar');
    expect(onPointerDragStart).not.toHaveBeenCalled();

    onSelectItemType.mockClear();
    onPointerDragStart.mockClear();

    fireEvent.pointerDown(solarCard);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onPointerDragStart).toHaveBeenCalledWith('solar', expect.any(Object));
    expect(onSelectItemType).toHaveBeenCalledWith('solar');
  });
});
