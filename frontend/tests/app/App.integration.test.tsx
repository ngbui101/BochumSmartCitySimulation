import React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/app/App';
import { createInitialGameState } from '../../src/game/initialGameState';
import { GAME_STATE_STORAGE_KEY, saveGameState } from '../../src/persistence/localStorageStore';
import {
  clearQuickStart,
  completeQuickStart,
  QUICK_START_STORAGE_KEY
} from '../../src/persistence/quickStartStore';
import type { FinalScore, GameState } from '../../src/types/game';

vi.mock('../../src/map/BochumMap', async () => {
  const React = await import('react');
  const { AssetDetailsPanel } = await import('../../src/sidebar/AssetDetailsPanel');

  return {
    BochumMap: (props: any) => {
      const selectedAsset =
        props.playerAssets.find((a: any) => a.id === props.selectedAssetId) ||
        props.existingAssets.find((a: any) => a.id === props.selectedAssetId);

      return React.createElement(
        'div',
        { 'data-testid': 'mock-bochum-map' },
        React.createElement('span', { 'data-testid': 'player-asset-count' }, props.playerAssets.length),
        React.createElement('span', { 'data-testid': 'existing-asset-count' }, props.existingAssets.length),
        React.createElement('span', { 'data-testid': 'selected-asset-id' }, props.selectedAssetId ?? 'none'),
        props.zoneFeedback
          ? React.createElement('span', { 'data-testid': 'zone-feedback' }, props.zoneFeedback.message)
          : null,
        props.placementFeedback
          ? React.createElement('span', { 'data-testid': 'placement-feedback' }, props.placementFeedback.message)
          : null,
        React.createElement(
          'span',
          { 'data-testid': 'placeable-zones-state' },
          props.placeableZones ? 'shown' : 'hidden'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDropAsset?.({ lat: 51.48, lng: 7.21 }) },
          'drop mitte'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDragPosition?.({ lat: 51.48, lng: 7.21 }) },
          'hover mitte'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDropAsset?.({ lat: 51.56, lng: 7.08 }) },
          'drop outside'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDropOutside?.() },
          'drop sidebar'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onSelectAsset?.(props.existingAssets[0]?.id) },
          'select existing'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onSelectAsset?.(props.playerAssets[0]?.id) },
          'select player'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onSelectAsset?.(undefined) },
          'clear selection'
        ),
        selectedAsset
          ? React.createElement(AssetDetailsPanel, { selectedAsset, onSell: props.onSell })
          : null
      );
    }
  };
});

function storedState(): GameState | null {
  const stored = localStorage.getItem(GAME_STATE_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  return JSON.parse(stored).state as GameState;
}

function finishedState(finalScore: FinalScore): GameState {
  return {
    ...createInitialGameState(),
    currentMonthIndex: 60,
    budget: 8_000_000,
    kpis: {
      energyAutarky: 66,
      citizenSatisfaction: 71,
      supplySecurity: 82
    },
    status: 'finished',
    finalScore
  };
}

describe('App integrated game flow', () => {
  beforeEach(() => {
    localStorage.clear();
    completeQuickStart();
    vi.useFakeTimers();
  });

  it('shows the first-run quick start and remembers when it is skipped', () => {
    clearQuickStart();

    render(<App />);

    expect(screen.getByTestId('quick-start-loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByRole('dialog', { name: 'Willkommen in Bochum' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Anleitung überspringen' }));

    expect(screen.queryByRole('dialog', { name: 'Willkommen in Bochum' })).not.toBeInTheDocument();
    expect(localStorage.getItem(QUICK_START_STORAGE_KEY)).toBe('completed');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('loads persisted game state and saves reducer changes', () => {
    saveGameState({
      ...createInitialGameState(),
      budget: 12_345_678,
      kpis: {
        energyAutarky: 33,
        citizenSatisfaction: 44,
        supplySecurity: 55
      }
    });

    render(<App />);

    expect(screen.getByTestId('budget-value')).toHaveTextContent('12.345.678 Euro');
    expect(screen.getByText('Energieautarkie')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const dragPreview = screen.getByTestId('placement-drag-preview');
    expect(dragPreview).toBeInTheDocument();
    expect(within(dragPreview).getByRole('img', { name: 'Solaranlage' })).toHaveAttribute(
      'src',
      '/icons/Solaranlage.png'
    );

    fireEvent.click(screen.getByRole('button', { name: 'drop mitte' }));

    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('1');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('11.145.678 Euro');
    expect(storedState()?.playerAssets).toHaveLength(1);
  });

  it('does not render the development state harness', () => {
    render(<App />);

    expect(screen.queryByTestId('dev-mock-harness')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Dev State-Modus/i)).not.toBeInTheDocument();
  });

  it('uses real undo and month actions from the bottom controls', () => {
    render(<App />);

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop mitte' }));

    const undoButton = screen.getByRole('button', { name: /R/ });
    expect(undoButton).toHaveAttribute('title', expect.stringContaining('Solaranlage'));

    fireEvent.click(screen.getByRole('button', { name: /N/ }));
    expect(screen.getByTestId('transition-curtain')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByTestId('month-display')).toHaveTextContent('Monat 2 / 60');
    expect(undoButton).toBeDisabled();
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'select player' }));
    expect(screen.getByTestId('asset-status')).toHaveTextContent(/active/i);
    expect(screen.getAllByTestId('kpi-delta-indicator').length).toBeGreaterThan(0);
  });

  it('validates drag placement with zone detection and placement rules before dispatching', () => {
    render(<App />);

    fireEvent.pointerDown(screen.getByTestId('buyable-item-wind'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'hover mitte' }));

    expect(screen.getByTestId('zone-feedback')).toHaveTextContent(/nicht möglich/i);

    fireEvent.click(screen.getByRole('button', { name: 'drop mitte' }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop outside' }));

    expect(screen.getByTestId('placement-feedback')).toHaveTextContent(/Zone/i);
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();
  });

  it('shows the item flyout on click but keeps it out of drag interactions', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('buyable-item-solar'));

    expect(screen.getByTestId('item-info-flyout')).toBeInTheDocument();
    expect(screen.getByTestId('selected-item-label')).toHaveTextContent('Solaranlage');

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByTestId('placement-drag-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();

    act(() => {
      fireEvent.pointerUp(window);
    });

    expect(screen.queryByTestId('placement-drag-preview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();
  });

  it('cancels purchase and deselects item when dropped on the sidebar', () => {
    render(<App />);

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId('placement-drag-preview')).toBeInTheDocument();
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'drop sidebar' }));

    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();
    expect(screen.getByTestId('placement-feedback')).toHaveTextContent(/Zone/i);
  });

  it('shows placeable zone boundaries when an item is selected without dragging', () => {
    render(<App />);

    expect(screen.getByTestId('placeable-zones-state')).toHaveTextContent('hidden');

    fireEvent.click(screen.getByTestId('buyable-item-solar'));

    expect(screen.getByTestId('placeable-zones-state')).toHaveTextContent('shown');
  });

  it('starts without existing assets and still sells and undoes player assets', () => {
    render(<App />);

    expect(screen.getByTestId('existing-asset-count')).toHaveTextContent('0');
    fireEvent.click(screen.getByRole('button', { name: 'select existing' }));
    expect(screen.queryByTestId('asset-title')).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop mitte' }));
    fireEvent.click(screen.getByRole('button', { name: 'select player' }));
    expect(screen.getByRole('button', { name: /Verkaufen/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Verkaufen/i }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: /R/ }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('1');
  });

  it('resets the running game, transient selections and persisted state after confirmation', () => {
    render(<App />);

    fireEvent.pointerDown(screen.getByTestId('buyable-item-solar'), {
      clientX: 24,
      clientY: 48
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop mitte' }));
    fireEvent.click(screen.getByRole('button', { name: 'select player' }));
    expect(screen.getByTestId('asset-title')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('buyable-item-wind'));
    expect(screen.getByTestId('item-info-flyout')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rückgängig/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Spiel zurücksetzen/i }));
    const resetDialog = screen.getByRole('dialog', { name: 'Spiel zurücksetzen?' });
    expect(resetDialog).toBeInTheDocument();
    fireEvent.click(within(resetDialog).getByRole('button', { name: 'Spiel zurücksetzen' }));

    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected-asset-id')).toHaveTextContent('none');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');
    expect(screen.queryByTestId('asset-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-info-flyout')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rückgängig/i })).toBeDisabled();
    expect(storedState()?.playerAssets).toHaveLength(0);
    expect(screen.getByTestId('quick-start-loading')).toBeInTheDocument();
  });

  it('renders the real endscreen from finalScore and restarts by clearing persisted state', () => {
    saveGameState(
      finishedState({
        totalScore: 77,
        breakdown: {
          budgetPoints: 8,
          energyAutarkyPoints: 6,
          citizenSatisfactionPoints: 7,
          supplySecurityPoints: 8
        },
        qualitativeSummary: 'Persisted score summary.'
      })
    );

    render(<App />);

    expect(screen.getByTestId('endscreen-overlay')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('Budgetpunkte')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Neustart/i }));

    expect(screen.queryByTestId('endscreen-overlay')).not.toBeInTheDocument();
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');
    expect(storedState()?.status).toBe('running');
    expect(screen.getByTestId('quick-start-loading')).toBeInTheDocument();
  });

  it('recalculates an old persisted endscore with the current point system', () => {
    const state = {
      ...createInitialGameState(),
      currentMonthIndex: 60,
      status: 'finished' as const,
      finalScore: {
        totalScore: 99,
        breakdown: {
          energyAutarky: 99,
          budgetEfficiency: 99,
          citizenSatisfaction: 99,
          supplySecurity: 99
        },
        qualitativeSummary: 'Old score format'
      }
    };
    localStorage.setItem(
      GAME_STATE_STORAGE_KEY,
      JSON.stringify({ version: 1, state })
    );

    render(<App />);

    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('Budgetpunkte')).toBeInTheDocument();
  });

  it('shows a non-blocking warning when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /Spielstand kann in diesem Browser nicht gespeichert werden/i
    );
  });
});
