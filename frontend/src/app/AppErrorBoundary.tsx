import React from 'react';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  reloadPage?: () => void;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unerwarteter Rendering-Fehler in der Simulation.', error, errorInfo);
  }

  private handleReload = () => {
    if (this.props.reloadPage) {
      this.props.reloadPage();
      return;
    }

    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-error-screen" aria-labelledby="app-error-title">
        <section className="app-error-card">
          <p className="eyebrow">Bochum Smart City</p>
          <h1 id="app-error-title">Etwas ist schiefgelaufen</h1>
          <p>
            Die Simulation konnte diesen Bildschirm nicht darstellen. Dein Spielstand wird nicht
            gelöscht.
          </p>
          <button type="button" onClick={this.handleReload}>
            Seite neu laden
          </button>
        </section>
      </main>
    );
  }
}
