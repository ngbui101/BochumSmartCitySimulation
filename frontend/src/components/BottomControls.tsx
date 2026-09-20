import React, { useState } from 'react';

export interface BottomControlsProps {
  canUndo: boolean;
  undoTooltip: string;
  onUndo: () => void;
  onNextMonth: () => void;
  onReset: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  canUndo,
  undoTooltip,
  onUndo,
  onNextMonth,
  onReset,
}) => {
  const [showCurtain, setShowCurtain] = useState(false);

  const handleNextMonthClick = () => {
    setShowCurtain(true);
    setTimeout(() => {
      onNextMonth();
      setShowCurtain(false);
    }, 600);
  };

  return (
    <>
      <div className="bottom-controls-container">
        <button
          className="btn-undo"
          onClick={onUndo}
          disabled={!canUndo}
          title={undoTooltip}
          aria-label="Rückgängig"
        >
          <span aria-hidden="true">↶</span>
          <span>Rückgängig</span>
        </button>
        <button
          className="btn-next-month"
          onClick={handleNextMonthClick}
          aria-label="Nächster Monat"
        >
          <span>Nächster Monat</span>
          <span aria-hidden="true">→</span>
        </button>
        <button className="btn-reset" onClick={onReset} aria-label="Spiel zurücksetzen">
          <span aria-hidden="true">↻</span>
          <span>Spiel zurücksetzen</span>
        </button>
      </div>

      {showCurtain && (
        <div className="transition-curtain" data-testid="transition-curtain">
          <div className="curtain-content">
            <div className="curtain-spinner" />
            <p className="curtain-text">Bochum entwickelt sich weiter...</p>
          </div>
        </div>
      )}
    </>
  );
};
