import React from 'react';

export interface ResetConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="reset-modal-backdrop" data-testid="reset-confirmation-backdrop">
      <section
        className="reset-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <p className="reset-modal-eyebrow">Spielstand</p>
        <h2 id="reset-modal-title">Spiel zurücksetzen?</h2>
        <p id="reset-modal-description">
          Dein aktueller Spielstand wird gelöscht und ein neues Spiel beginnt.
        </p>
        <div className="reset-modal-actions">
          <button type="button" className="reset-modal-cancel" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="button" className="reset-modal-confirm" onClick={onConfirm}>
            Spiel zurücksetzen
          </button>
        </div>
      </section>
    </div>
  );
};
