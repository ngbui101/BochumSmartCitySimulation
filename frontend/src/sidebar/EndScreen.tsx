import React from 'react';
import type { FinalScore } from '../types/game';

export interface EndScreenProps {
  finalScore: FinalScore;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ finalScore, onRestart }) => {
  const { totalScore, breakdown, qualitativeSummary } = finalScore;

  // Qualitative German feedback based on total score
  let germanSummary = '';
  if (totalScore >= 80) {
    germanSummary = 'Hervorragende Leistung! Bochum ist eine moderne, grüne und zukunftssichere Stadt geworden.';
  } else if (totalScore >= 60) {
    germanSummary = 'Gute Arbeit! Sie haben wichtige Fortschritte erzielt und die Lebensqualität spürbar verbessert.';
  } else if (totalScore >= 40) {
    germanSummary = 'Solide Leistung. Einige Bereiche bieten jedoch noch deutliches Verbesserungspotenzial.';
  } else {
    germanSummary = 'Bochum steht vor großen Herausforderungen. Versuchen Sie es noch einmal, um eine stabilere und nachhaltigere Stadt aufzubauen.';
  }

  return (
    <div className="endscreen-overlay" data-testid="endscreen-overlay">
      <div className="endscreen-container">
        <header className="endscreen-header">
          <p className="endscreen-eyebrow">Simulation Beendet</p>
          <h1>Bochum Smart City</h1>
        </header>

        <div className="endscreen-main-score">
          <div className="score-circle">
            <span className="score-value">{totalScore}</span>
            <span className="score-label">Gesamtpunktzahl</span>
          </div>
        </div>

        <div className="endscreen-breakdown">
          <div className="breakdown-card">
            <span className="breakdown-label">Energieautarkie</span>
            <span className="breakdown-value">{breakdown.energyAutarky}%</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Budgeteffizienz</span>
            <span className="breakdown-value">{breakdown.budgetEfficiency}%</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Bürgerzufriedenheit</span>
            <span className="breakdown-value">{breakdown.citizenSatisfaction}%</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Versorgungssicherheit</span>
            <span className="breakdown-value">{breakdown.supplySecurity}%</span>
          </div>
        </div>

        <div className="endscreen-summary">
          <p className="summary-german">{germanSummary}</p>
          <p className="summary-original">{qualitativeSummary}</p>
        </div>

        <div className="endscreen-actions">
          <button className="btn-restart" onClick={onRestart} aria-label="Neustart">
            Neustart
          </button>
        </div>
      </div>
    </div>
  );
};
