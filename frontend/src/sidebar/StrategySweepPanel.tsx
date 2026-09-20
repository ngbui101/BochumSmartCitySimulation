import React, { useState } from 'react';

export const StrategySweepPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="strategy-sweep-panel" data-testid="strategy-sweep-panel">
      <button
        type="button"
        className="strategy-sweep-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>
          <strong>Strategie-Sweep</strong>
          <small>Erfolgsquoten bei 135–200 % Verbrauch</small>
        </span>
        <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
      </button>

      {isOpen && (
        <div className="strategy-sweep-content">
          <p>
            Der markierte Bereich zeigt, wie stark steigender Verbrauch die sechs Strategien
            beeinflusst.
          </p>
          <img
            src="/strategy-sweep.png"
            alt="Strategie-Sweep mit Erfolgsquoten aller sechs Strategien von 135 bis 200 Prozent Verbrauch"
            loading="lazy"
          />
        </div>
      )}
    </section>
  );
};
