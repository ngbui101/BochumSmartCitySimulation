import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EndScreen } from '../../src/sidebar/EndScreen';
import type { FinalScore } from '../../src/types/game';

describe('EndScreen component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFinalScore: FinalScore = {
    totalScore: 78,
    breakdown: {
      budgetPoints: 12,
      energyAutarkyPoints: 6,
      citizenSatisfactionPoints: 7,
      supplySecurityPoints: 8,
    },
    qualitativeSummary: 'Great job! Bochum is now significantly more autarkic with satisfied citizens.',
  };

  it('renders total score, evaluation breakdown, and qualitative text', () => {
    const onRestart = vi.fn();
    render(<EndScreen finalScore={mockFinalScore} onRestart={onRestart} />);

    // Total Score
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText(/Gesamtpunktzahl/i)).toBeInTheDocument();

    // Individual breakdown categories and values
    expect(screen.getByText(/Energieautarkie/i)).toBeInTheDocument();
    expect(screen.getByText('+6 Punkte')).toBeInTheDocument();

    expect(screen.getByText(/Budgetpunkte/i)).toBeInTheDocument();
    expect(screen.getByText('+12 Punkte')).toBeInTheDocument();

    expect(screen.getByText(/Bürgerzufriedenheit/i)).toBeInTheDocument();
    expect(screen.getByText('+7 Punkte')).toBeInTheDocument();

    expect(screen.getByText(/Versorgungssicherheit/i)).toBeInTheDocument();
    expect(screen.getByText('+8 Punkte')).toBeInTheDocument();

    // Qualitative Summary
    expect(screen.getByText(mockFinalScore.qualitativeSummary)).toBeInTheDocument();
    // German qualitative feedback text (e.g. "Gute Arbeit!")
    expect(screen.getByText(/Hervorragende Leistung!/i)).toBeInTheDocument();
  });

  it('calls onRestart when clicking the Restart button', () => {
    const onRestart = vi.fn();
    render(<EndScreen finalScore={mockFinalScore} onRestart={onRestart} />);

    const restartBtn = screen.getByRole('button', { name: /Neustart/i });
    fireEvent.click(restartBtn);

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('explains bankruptcy and keeps the score breakdown visible', () => {
    render(
      <EndScreen
        finalScore={mockFinalScore}
        status="lost"
        lossReason="bankrupt"
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText('Bankrott')).toBeInTheDocument();
    expect(screen.getByText(/Budget ist aufgebraucht/i)).toBeInTheDocument();
    expect(screen.getByText('+12 Punkte')).toBeInTheDocument();
  });

  it('explains when the citizens vote the city government out', () => {
    render(
      <EndScreen
        finalScore={mockFinalScore}
        status="lost"
        lossReason="voted_out"
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText('Abgewählt')).toBeInTheDocument();
    expect(screen.getByText(/Bürgerzufriedenheit ist auf 0 gefallen/i)).toBeInTheDocument();
  });
});
