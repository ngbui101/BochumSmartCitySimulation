import { useAppState } from './appState';

export function App() {
  const { state } = useAppState();

  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <aside className="app-sidebar" aria-label="Spielstatus und Aktionen">
        <header className="sidebar-header">
          <p className="eyebrow">MVP 1</p>
          <h1>Bochum Smart City</h1>
        </header>
        <dl className="sidebar-metrics">
          <div>
            <dt>Budget</dt>
            <dd>{state ? `${state.budget.toLocaleString('de-DE')} Euro` : 'Bereit'}</dd>
          </div>
          <div>
            <dt>Monat</dt>
            <dd>{state ? state.currentMonthIndex + 1 : 1} / 60</dd>
          </div>
        </dl>
      </aside>
      <section className="map-stage" aria-label="Bochum-Karte">
        <div className="map-placeholder">
          <span>Bochum-Karte</span>
        </div>
      </section>
    </main>
  );
}
