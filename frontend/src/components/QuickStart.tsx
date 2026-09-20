import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    body: 'Du startest ohne bestehende Anlagen in Monat 1 von 60. Der saisonale Verbrauch wächst im Spielverlauf bis auf 135 % des Startverbrauchs.'
  },
  {
    target: 'kpis',
    title: 'Budget und Kennzahlen',
    body: 'Du startest mit 18 Mio. € Budget, 0 % Energieautarkie, 50 % Bürgerzufriedenheit und 0 % Versorgungssicherheit. Sinkt die Bürgerzufriedenheit auf 0, verlierst du.'
  },
  {
    target: 'weather',
    title: 'Wetter im Blick behalten',
    body: 'Das Wetter wird für jede Session zufällig erzeugt und beeinflusst, wie viel Energie Sonne und Wind liefern. Die Prognose hilft dir bei der Planung.'
  },
  {
    target: 'subsidies',
    title: 'Förderungen einsetzen',
    body: 'Mit Förderungen unterstützt du private Anlagen. Sobald je Programm 600.000 € kumuliert sind, entsteht automatisch eine unveränderbare Anlage: Solar entlastet das Netz mit 7, Speicher mit 10 Einheiten. Private Anlagen kosten 0 € Betrieb und bringen der Stadt keine Einnahmen.'
  },
  {
    target: 'build',
    title: 'Neue Anlagen bauen',
    body: 'Wähle eine Bauoption und ziehe sie auf eine passende Zone der Karte. Jede öffentliche Anlage hat eigene Kosten und Stärken. Ab der dritten öffentlichen Anlage in einem Stadtteil kostet jedes weitere Bauwerk 1 Punkt Bürgerzufriedenheit.'
  },
  {
    target: 'controls',
    title: 'Monat spielen und zurücksetzen',
    body: 'Mit „Nächster Monat“ simulierst du Wetter, Verbrauch, Energie, Einnahmen und Kosten der nächsten Runde. Unten findest du Rückgängig und – nach Bestätigung – das Zurücksetzen.'
  }
];

type QuickStartPhase = 'loading' | 'welcome' | 'guide';
type DialogPosition = { top: number; left: number };

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
  const [dialogPosition, setDialogPosition] = useState<DialogPosition | null>(null);
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

  useLayoutEffect(() => {
    if (!isOpen || phase !== 'guide') {
      setDialogPosition(null);
      return undefined;
    }

    setDialogPosition(null);
    const target = GUIDE_STEPS[stepIndex].target;
    const targetElement = document.querySelector<HTMLElement>(`[data-onboarding="${target}"]`);

    if (!targetElement) {
      return undefined;
    }

    targetElement.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });

    const updateDialogPosition = () => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 768;
      const viewportPadding = 16;
      const gap = 20;
      const dialogWidth = dialogRect.width || Math.min(520, viewportWidth - viewportPadding * 2);
      const dialogHeight = dialogRect.height;
      const rightPosition = targetRect.right + gap;
      const leftPosition = targetRect.left - dialogWidth - gap;
      const maxLeft = Math.max(viewportPadding, viewportWidth - dialogWidth - viewportPadding);
      const preferredLeft = rightPosition + dialogWidth <= viewportWidth - viewportPadding
        ? rightPosition
        : leftPosition;
      const left = Math.min(Math.max(preferredLeft, viewportPadding), maxLeft);
      const maxTop = Math.max(viewportPadding, viewportHeight - dialogHeight - viewportPadding);
      const preferredTop = targetRect.top + (targetRect.height - dialogHeight) / 2;
      const top = Math.min(Math.max(preferredTop, viewportPadding), maxTop);

      setDialogPosition({ top, left });
    };

    updateDialogPosition();
    window.addEventListener('resize', updateDialogPosition);
    document.addEventListener('scroll', updateDialogPosition, true);

    return () => {
      window.removeEventListener('resize', updateDialogPosition);
      document.removeEventListener('scroll', updateDialogPosition, true);
    };
  }, [isOpen, phase, stepIndex]);

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
  const dialogClassName = `quick-start-dialog${dialogPosition ? ' quick-start-dialog--anchored' : ' quick-start-dialog--centered'}`;
  const handleComplete = () => {
    onTargetChange?.(null);
    onComplete();
  };

  return (
    <div className="quick-start-overlay">
      <div
        ref={dialogRef}
        className={dialogClassName}
        style={dialogPosition ? { top: `${dialogPosition.top}px`, left: `${dialogPosition.left}px` } : undefined}
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
            <p>
              Du startest mit 18 Mio. € Budget, 0 % Energieautarkie, 50 % Bürgerzufriedenheit und
              0 % Versorgungssicherheit – ohne bestehende Anlagen.
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
