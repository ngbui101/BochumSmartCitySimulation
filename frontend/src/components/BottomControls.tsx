import React, { useState } from 'react';

export interface BottomControlsProps {
  canUndo: boolean;
  undoTooltip: string;
  onUndo: () => void;
  onNextMonth: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  canUndo,
  undoTooltip,
  onUndo,
  onNextMonth,
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
          aria-label="Rueckgaengig"
        >
          <span aria-hidden="true">↶</span>
          <span>Rueckgaengig</span>
        </button>
        <button
          className="btn-next-month"
          onClick={handleNextMonthClick}
          aria-label="Naechster Monat"
        >
          <span>Naechster Monat</span>
          <span aria-hidden="true">→</span>
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
