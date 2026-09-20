import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ResetConfirmationModal } from '../../src/components/ResetConfirmationModal';

describe('ResetConfirmationModal', () => {
  it('renders a game-styled confirmation dialog with cancel and confirm actions', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ResetConfirmationModal isOpen onCancel={onCancel} onConfirm={onConfirm} />
    );

    const dialog = screen.getByRole('dialog', { name: 'Spiel zurücksetzen?' });
    expect(within(dialog).getByText(/aktueller Spielstand wird gelöscht/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Spiel zurücksetzen' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders nothing while closed', () => {
    render(<ResetConfirmationModal isOpen={false} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
