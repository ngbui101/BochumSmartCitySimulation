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

  it('renders all buyable items as compact cards with icon, name, price, and description', () => {
    render(<BuyableItemList {...defaultProps} />);

    const solarCard = screen.getByTestId('buyable-item-solar');
    const windCard = screen.getByTestId('buyable-item-wind');
    const storageCard = screen.getByTestId('buyable-item-storage');

    expect(solarCard).toHaveAttribute('title', 'Solaranlage');
    expect(windCard).toHaveAttribute('title', 'Kleinwindanlage');
    expect(storageCard).toHaveAttribute('title', 'Energiespeicher');

    expect(solarCard).not.toHaveClass('disabled');
    expect(windCard).not.toHaveClass('disabled');
    expect(storageCard).not.toHaveClass('disabled');

    expect(solarCard).toHaveTextContent('Solaranlage');
    expect(solarCard).toHaveTextContent('1.200.000');
    expect(solarCard).toHaveTextContent('Stark in sonnigen Monaten');

    expect(windCard).toHaveTextContent('Kleinwindanlage');
    expect(windCard).toHaveTextContent('2.800.000');
    expect(windCard).toHaveTextContent('Nicht überall erlaubt');

    expect(storageCard).toHaveTextContent('Energiespeicher');
    expect(storageCard).toHaveTextContent('1.700.000');
    expect(storageCard).toHaveTextContent('Mehr Versorgungssicherheit');

    expect(screen.getByRole('img', { name: 'Solaranlage' })).toHaveAttribute(
      'src',
      '/icons/Solaranlage.png'
    );
    expect(screen.getByRole('img', { name: 'Kleinwindanlage' })).toHaveAttribute(
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

    expect(screen.getByTestId('buyable-item-wind')).toHaveAttribute(
      'title',
      'Nicht genügend Budget (Benötigt: 2.800.000 Euro, Vorhanden: 1.500.000 Euro)'
    );
    expect(screen.getByTestId('buyable-item-storage')).toHaveAttribute(
      'title',
      'Nicht genügend Budget (Benötigt: 1.700.000 Euro, Vorhanden: 1.500.000 Euro)'
    );
    expect(screen.getByTestId('buyable-item-solar')).toHaveAttribute('title', 'Solaranlage');
  });

  it('renders selected item information as a side flyout outside the sidebar item list', () => {
    render(<BuyableItemList {...defaultProps} selectedItemType="solar" />);

    const itemList = screen.getByTestId('buyable-item-list');
    const flyout = screen.getByTestId('item-info-flyout');

    expect(itemList).not.toContainElement(flyout);
    expect(flyout).toHaveClass('item-info-flyout');
    expect(screen.getByTestId('selected-item-label')).toHaveTextContent('Solaranlage');
    expect(screen.getByTestId('selected-item-cost')).toHaveTextContent('1.200.000');
    expect(screen.getByTestId('selected-item-description')).toHaveTextContent(
      'Günstige Erzeugung'
    );
    expect(flyout).toHaveTextContent('Erzeugung: 7 MW');
    expect(flyout).toHaveTextContent('Betrieb: 35.000 Euro/Monat');
    expect(flyout.querySelector('.zone-profile-image')).not.toBeInTheDocument();
    expect(flyout.querySelector('.zone-profile-thumb')).not.toBeInTheDocument();
  });

  it('closes selected item information when clicking outside the item list and flyout', () => {
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
