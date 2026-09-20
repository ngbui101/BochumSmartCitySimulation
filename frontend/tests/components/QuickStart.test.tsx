import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuickStart } from '../../src/components/QuickStart';

describe('QuickStart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading first and then offers start or skip', () => {
    const onComplete = vi.fn();

    render(<QuickStart isOpen onComplete={onComplete} />);

    expect(screen.getByTestId('quick-start-loading')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole('dialog', { name: 'Willkommen in Bochum' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anleitung starten' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anleitung überspringen' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Anleitung überspringen' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('walks through the sidebar groups in order and finishes with Viel Spaß', () => {
    const onComplete = vi.fn();
    const onTargetChange = vi.fn();

    render(<QuickStart isOpen onComplete={onComplete} onTargetChange={onTargetChange} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Anleitung starten' }));

    expect(screen.getByText('Spielstatus und Monat')).toBeInTheDocument();
    expect(onTargetChange).toHaveBeenLastCalledWith('status');

    const expectedSteps = [
      ['Budget und Kennzahlen', 'kpis'],
      ['Wetter im Blick behalten', 'weather'],
      ['Förderungen einsetzen', 'subsidies'],
      ['Neue Anlagen bauen', 'build'],
      ['Monat spielen und zurücksetzen', 'controls']
    ] as const;

    for (const [title, target] of expectedSteps) {
      fireEvent.click(screen.getByRole('button', { name: 'Weiter' }));
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(onTargetChange).toHaveBeenLastCalledWith(target);
    }

    fireEvent.click(screen.getByRole('button', { name: 'Viel Spaß!' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onTargetChange).toHaveBeenLastCalledWith(null);
  });

  it('scrolls the active sidebar target into view and anchors the hint beside it', () => {
    const target = document.createElement('div');
    target.dataset.onboarding = 'status';
    const scrollIntoView = vi.fn();
    const targetRect = {
      top: 120,
      bottom: 220,
      left: 20,
      right: 320,
      width: 300,
      height: 100,
      x: 20,
      y: 120,
      toJSON: () => ({})
    } as DOMRect;

    Object.defineProperty(target, 'scrollIntoView', { value: scrollIntoView });
    Object.defineProperty(target, 'getBoundingClientRect', { value: () => targetRect });
    document.body.appendChild(target);

    try {
      render(<QuickStart isOpen onComplete={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(700);
      });
      fireEvent.click(screen.getByRole('button', { name: 'Anleitung starten' }));

      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest'
      });
      expect(screen.getByRole('dialog', { name: 'Spielstatus und Monat' })).toHaveClass(
        'quick-start-dialog--anchored'
      );
      expect(screen.getByRole('dialog', { name: 'Spielstatus und Monat' })).toHaveStyle({
        left: '340px'
      });
    } finally {
      target.remove();
    }
  });
});
