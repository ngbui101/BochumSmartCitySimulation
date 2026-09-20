import React from 'react';
import type { FinalScore, GameStatus, LossReason } from '../types/game';

export interface EndScreenProps {
  finalScore: FinalScore;
  status?: GameStatus;
  lossReason?: LossReason;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  finalScore,
  status = 'finished',
  lossReason,
  onRestart
}) => {
  const { totalScore, breakdown, qualitativeSummary } = finalScore;

  const isLost = status === 'lost';
  const lossTitle = lossReason === 'bankrupt' ? 'Bankrott' : 'Abgewählt';
  const lossSummary =
    lossReason === 'bankrupt'
      ? 'Dein Budget ist aufgebraucht. Mit einer neuen Runde kannst du Bochum wieder aufbauen.'
      : 'Die Bürgerzufriedenheit ist auf 0 gefallen. Mit einer neuen Runde kannst du das Vertrauen zurückgewinnen.';
  const germanSummary = isLost
    ? lossSummary
    : totalScore >= 36
      ? 'Hervorragende Leistung! Bochum ist eine moderne, grüne und zukunftssichere Stadt geworden.'
      : totalScore >= 26
        ? 'Gute Arbeit! Du hast wichtige Fortschritte erzielt und die Lebensqualität verbessert.'
        : totalScore >= 16
          ? 'Solide Leistung. Einige Bereiche bieten noch deutliches Verbesserungspotenzial.'
          : 'Bochum steht vor großen Herausforderungen. Beim nächsten Versuch wird es besser.';

  return (
    <div className="endscreen-overlay" data-testid="endscreen-overlay">
      <div className="endscreen-container">
        <header className="endscreen-header">
          <p className="endscreen-eyebrow">{isLost ? 'Runde beendet' : 'Simulation beendet'}</p>
          <h1>{isLost ? lossTitle : 'Bochum Smart City'}</h1>
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
            <span className="breakdown-value">+{breakdown.energyAutarkyPoints} Punkte</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Budgetpunkte</span>
            <span className="breakdown-value">+{breakdown.budgetPoints} Punkte</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Bürgerzufriedenheit</span>
            <span className="breakdown-value">+{breakdown.citizenSatisfactionPoints} Punkte</span>
          </div>
          <div className="breakdown-card">
            <span className="breakdown-label">Versorgungssicherheit</span>
            <span className="breakdown-value">+{breakdown.supplySecurityPoints} Punkte</span>
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
