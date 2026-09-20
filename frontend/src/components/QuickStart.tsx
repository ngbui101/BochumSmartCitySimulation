import React, { useEffect, useRef, useState } from 'react';

export type QuickStartTarget = 'status' | 'kpis' | 'weather' | 'subsidies' | 'build' | 'controls';

type GuideStep = {
  target: QuickStartTarget;
  title: string;
  body: string;
};

const GUIDE_STEPS: GuideStep[] = [
  {
    target: 'status',
    title: 'Spielstatus und Monat',
    body: 'Hier siehst du, in welchem Monat und Jahr du bist. Plane Schritt für Schritt und behalte Bochums Entwicklung im Blick.'
  },
  {
    target: 'kpis',
    title: 'Budget und Kennzahlen',
    body: 'Das Budget bezahlt deine Entscheidungen. Energieautarkie, Bürgerzufriedenheit und Versorgungssicherheit zeigen, wie gut deine Stadt läuft.'
  },
  {
    target: 'weather',
    title: 'Wetter im Blick behalten',
    body: 'Die Wetterprognose hilft dir bei der Planung. Sonne und Wind beeinflussen, wie viel Energie deine Anlagen erzeugen.'
  },
  {
    target: 'subsidies',
    title: 'Förderungen einsetzen',
    body: 'Mit Förderungen unterstützt du private Anlagen. Wähle eine Stufe und beobachte, wie sich die monatlichen Kosten entwickeln.'
  },
  {
    target: 'build',
    title: 'Neue Anlagen bauen',
    body: 'Wähle eine Bauoption und ziehe sie auf eine passende Zone der Karte. Jede Anlage hat eigene Stärken und Kosten.'
  },
  {
    target: 'controls',
    title: 'Monat spielen und zurücksetzen',
    body: 'Mit „Nächster Monat“ simulierst du die nächste Runde. Unten findest du auch Rückgängig und – nach Bestätigung – das Zurücksetzen.'
  }
];

type QuickStartPhase = 'loading' | 'welcome' | 'guide';

export interface QuickStartProps {
  isOpen: boolean;
  onComplete: () => void;
  onTargetChange?: (target: QuickStartTarget | null) => void;
}

export const QuickStart: React.FC<QuickStartProps> = ({
  isOpen,
  onComplete,
  onTargetChange
}) => {
  const [phase, setPhase] = useState<QuickStartPhase>('loading');
  const [stepIndex, setStepIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setPhase('loading');
    setStepIndex(0);
    const timer = window.setTimeout(() => setPhase('welcome'), 650);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      onTargetChange?.(null);
      return;
    }

    onTargetChange?.(phase === 'guide' ? GUIDE_STEPS[stepIndex].target : null);
    dialogRef.current?.focus();
  }, [isOpen, onTargetChange, phase, stepIndex]);

  if (!isOpen) {
    return null;
  }

  if (phase === 'loading') {
    return (
      <div className="quick-start-loading-overlay" data-testid="quick-start-loading">
        <div className="curtain-content">
          <div className="curtain-spinner" />
          <p className="curtain-text">Bochum wird vorbereitet...</p>
          <span className="quick-start-loading-hint">Deine Stadt. Deine Entscheidungen.</span>
        </div>
      </div>
    );
  }

  const isWelcome = phase === 'welcome';
  const currentStep = GUIDE_STEPS[stepIndex];
  const isLastStep = stepIndex === GUIDE_STEPS.length - 1;
  const handleComplete = () => {
    onTargetChange?.(null);
    onComplete();
  };

  return (
    <div className="quick-start-overlay">
      <div
        ref={dialogRef}
        className="quick-start-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-start-title"
        tabIndex={-1}
      >
        <p className="quick-start-eyebrow">Bochum Smart City</p>
        {isWelcome ? (
          <>
            <h2 id="quick-start-title">Willkommen in Bochum</h2>
            <p>
              Baue eine sichere und nachhaltige Energieversorgung auf. Treffe gute Entscheidungen,
              halte die Bürger zufrieden und entwickle Bochum Monat für Monat weiter.
            </p>
            <p className="quick-start-goal">Dein Ziel: möglichst viele Punkte sammeln, bevor Monat 60 endet.</p>
            <div className="quick-start-actions">
              <button type="button" className="quick-start-button quick-start-button--primary" onClick={() => setPhase('guide')}>
                Anleitung starten
              </button>
              <button type="button" className="quick-start-button quick-start-button--secondary" onClick={handleComplete}>
                Anleitung überspringen
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="quick-start-step-count">Schritt {stepIndex + 1} von {GUIDE_STEPS.length}</p>
            <h2 id="quick-start-title">{currentStep.title}</h2>
            <p>{currentStep.body}</p>
            <div className="quick-start-actions">
              <button
                type="button"
                className="quick-start-button quick-start-button--primary"
                onClick={() => (isLastStep ? handleComplete() : setStepIndex((index) => index + 1))}
              >
                {isLastStep ? 'Viel Spaß!' : 'Weiter'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
