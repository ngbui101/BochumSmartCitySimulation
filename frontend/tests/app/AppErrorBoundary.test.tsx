import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppErrorBoundary } from '../../src/app/AppErrorBoundary';

function BrokenWidget(): never {
  throw new Error('render failed');
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a German recovery screen and reloads when requested', () => {
    const reloadPage = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary reloadPage={reloadPage}>
        <BrokenWidget />
      </AppErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /etwas ist schiefgelaufen/i })).toBeInTheDocument();
    expect(screen.getByText(/spielstand wird nicht gelöscht/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /seite neu laden/i }));

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});
