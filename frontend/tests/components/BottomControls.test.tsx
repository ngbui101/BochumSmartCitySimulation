import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BottomControls } from '../../src/components/BottomControls';

describe('BottomControls component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders undo and next month buttons in the correct order with German umlauts', () => {
    const onUndo = vi.fn();
    const onNextMonth = vi.fn();
    const { container } = render(
      <BottomControls
        canUndo={true}
        undoTooltip="Letzten Schritt rückgängig machen"
        onUndo={onUndo}
        onNextMonth={onNextMonth}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(/Rückgängig/i);
    expect(buttons[1]).toHaveTextContent(/Nächster Monat/i);
  });

  it('sets the title/tooltip and disabled state on the Undo button', () => {
    const onUndo = vi.fn();
    const onNextMonth = vi.fn();

    const { rerender } = render(
      <BottomControls
        canUndo={true}
        undoTooltip="Letzten Schritt rückgängig machen"
        onUndo={onUndo}
        onNextMonth={onNextMonth}
      />
    );

    const undoBtn = screen.getByRole('button', { name: /Rückgängig/i });
    expect(undoBtn).toHaveAttribute('title', 'Letzten Schritt rückgängig machen');
    expect(undoBtn).not.toBeDisabled();

    rerender(
      <BottomControls
        canUndo={false}
        undoTooltip="Kein Schritt zum Rückgängig machen"
        onUndo={onUndo}
        onNextMonth={onNextMonth}
      />
    );
    expect(undoBtn).toHaveAttribute('title', 'Kein Schritt zum Rückgängig machen');
    expect(undoBtn).toBeDisabled();
  });

  it('calls onUndo when clicking the Undo button and canUndo is true', () => {
    const onUndo = vi.fn();
    const onNextMonth = vi.fn();
    render(
      <BottomControls
        canUndo={true}
        undoTooltip="Undo"
        onUndo={onUndo}
        onNextMonth={onNextMonth}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Rückgängig/i }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('triggers a transition curtain overlay on Next Month click, and calls onNextMonth after 600ms', () => {
    vi.useFakeTimers();
    const onUndo = vi.fn();
    const onNextMonth = vi.fn();
    render(
      <BottomControls
        canUndo={true}
        undoTooltip="Undo"
        onUndo={onUndo}
        onNextMonth={onNextMonth}
      />
    );

    expect(document.querySelector('.transition-curtain')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Nächster Monat/i }));

    const curtain = document.querySelector('.transition-curtain');
    expect(curtain).toBeInTheDocument();
    expect(curtain).toHaveTextContent(/Bochum/i);
    expect(onNextMonth).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onNextMonth).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.transition-curtain')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

});
