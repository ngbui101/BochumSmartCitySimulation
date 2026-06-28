import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/app/App';
import { createInitialGameState } from '../../src/game/initialGameState';
import { GAME_STATE_STORAGE_KEY, saveGameState } from '../../src/persistence/localStorageStore';
import type { FinalScore, GameState } from '../../src/types/game';

vi.mock('../../src/map/BochumMap', async () => {
  const React = await import('react');

  return {
    BochumMap: (props: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-bochum-map' },
        React.createElement('span', { 'data-testid': 'player-asset-count' }, props.playerAssets.length),
        React.createElement('span', { 'data-testid': 'selected-asset-id' }, props.selectedAssetId ?? 'none'),
        props.zoneFeedback
          ? React.createElement('span', { 'data-testid': 'zone-feedback' }, props.zoneFeedback.message)
          : null,
        props.placementFeedback
          ? React.createElement('span', { 'data-testid': 'placement-feedback' }, props.placementFeedback.message)
          : null,
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDropAsset?.({ lat: 51.48, lng: 7.21 }) },
          'drop innenstadt'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDragPosition?.({ lat: 51.48, lng: 7.21 }) },
          'hover innenstadt'
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => props.onDropAsset?.({ lat: 51.56, lng: 7.08 }) },
          'drop outside'
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
        )
      )
  };
});

function createDragDataTransfer(): DataTransfer {
  return {
    setData: vi.fn(),
    getData: vi.fn(),
    clearData: vi.fn(),
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: []
  } as unknown as DataTransfer;
}

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
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('starts in real-state mode, loads persisted game state, and saves reducer changes', () => {
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
    expect(screen.getByTestId('dev-mock-harness')).toHaveTextContent('Real-State');

    fireEvent.dragStart(screen.getByTestId('buyable-item-solar'), {
      dataTransfer: createDragDataTransfer()
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop innenstadt' }));

    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('1');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('11.145.678 Euro');
    expect(storedState()?.playerAssets).toHaveLength(1);
  });

  it('uses real undo and month actions from the bottom controls', () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.dragStart(screen.getByTestId('buyable-item-solar'), {
      dataTransfer: createDragDataTransfer()
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop innenstadt' }));

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

    fireEvent.dragStart(screen.getByTestId('buyable-item-wind'), {
      dataTransfer: createDragDataTransfer()
    });
    fireEvent.click(screen.getByRole('button', { name: 'hover innenstadt' }));

    expect(screen.getByTestId('zone-feedback')).toHaveTextContent(/nicht erlaubt/i);

    fireEvent.click(screen.getByRole('button', { name: 'drop innenstadt' }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');

    fireEvent.dragStart(screen.getByTestId('buyable-item-solar'), {
      dataTransfer: createDragDataTransfer()
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop outside' }));

    expect(screen.getByTestId('placement-feedback')).toHaveTextContent(/Zone/i);
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');
  });

  it('selects, clears, sells, and undoes player assets while existing assets remain read-only', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'select existing' }));
    expect(screen.getByText(/Bestandsanlage/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Verkaufen/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'clear selection' }));
    expect(screen.queryByTestId('asset-title')).not.toBeInTheDocument();

    fireEvent.dragStart(screen.getByTestId('buyable-item-solar'), {
      dataTransfer: createDragDataTransfer()
    });
    fireEvent.click(screen.getByRole('button', { name: 'drop innenstadt' }));
    fireEvent.click(screen.getByRole('button', { name: 'select player' }));
    expect(screen.getByRole('button', { name: /Verkaufen/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Verkaufen/i }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByRole('button', { name: /R/ }));
    expect(screen.getByTestId('player-asset-count')).toHaveTextContent('1');
  });

  it('renders the real endscreen from finalScore and restarts by clearing persisted state', () => {
    saveGameState(
      finishedState({
        totalScore: 77,
        breakdown: {
          energyAutarky: 66,
          budgetEfficiency: 44,
          citizenSatisfaction: 71,
          supplySecurity: 82
        },
        qualitativeSummary: 'Persisted score summary.'
      })
    );

    render(<App />);

    expect(screen.getByTestId('endscreen-overlay')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('Budgeteffizienz')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Neustart/i }));

    expect(screen.queryByTestId('endscreen-overlay')).not.toBeInTheDocument();
    expect(screen.getByTestId('budget-value')).toHaveTextContent('18.000.000 Euro');
    expect(storedState()?.status).toBe('running');
  });
});
