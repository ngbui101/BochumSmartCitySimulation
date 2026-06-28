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
      energyAutarky: 65,
      budgetEfficiency: 82,
      citizenSatisfaction: 70,
      supplySecurity: 78,
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
    expect(screen.getByText('65%')).toBeInTheDocument();

    expect(screen.getByText(/Budgeteffizienz/i)).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();

    expect(screen.getByText(/Bürgerzufriedenheit/i)).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();

    expect(screen.getByText(/Versorgungssicherheit/i)).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();

    // Qualitative Summary
    expect(screen.getByText(mockFinalScore.qualitativeSummary)).toBeInTheDocument();
    // German qualitative feedback text (e.g. "Gute Arbeit!")
    expect(screen.getByText(/Gute Arbeit!/i)).toBeInTheDocument();
  });

  it('calls onRestart when clicking the Restart button', () => {
    const onRestart = vi.fn();
    render(<EndScreen finalScore={mockFinalScore} onRestart={onRestart} />);

    const restartBtn = screen.getByRole('button', { name: /Neustart/i });
    fireEvent.click(restartBtn);

    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
