import React, { useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { BochumMap } from '../map/BochumMap';
import { BottomControls } from '../components/BottomControls';
import { EndScreen } from '../sidebar/EndScreen';
import { initialMockState, midgameMockState, finishMockState } from '../testing/mockGameState';
import type { GameState } from '../types/game';

export function App() {
  const [state, setState] = useState<GameState>(initialMockState);
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>(undefined);

  const handleMockStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let newState = initialMockState;
    if (value === 'midgame') {
      newState = midgameMockState;
    } else if (value === 'finished') {
      newState = finishMockState;
    }
    setState(newState);
    setSelectedAssetId(undefined); // Reset selection on state change
  };

  const handleSelectAsset = (id: string | undefined) => {
    setSelectedAssetId(id);
  };

  const handleSellAsset = (id: string) => {
    if (import.meta.env.DEV) {
      console.debug('Sell asset callback triggered for ID:', id);
    }
    setSelectedAssetId(undefined);
  };

  const handleUndo = () => {
    if (import.meta.env.DEV) {
      console.debug('Undo callback triggered');
    }
  };

  const handleNextMonth = () => {
    if (import.meta.env.DEV) {
      console.debug('Next month callback triggered');
    }
  };

  const handleRestart = () => {
    setState(initialMockState);
    setSelectedAssetId(undefined);
  };

  // Find the selected asset object (from player or existing assets)
  const selectedAsset =
    state.playerAssets.find((a) => a.id === selectedAssetId) ||
    state.existingAssets.find((a) => a.id === selectedAssetId);

  const canUndo = state.playerAssets.length > 0 || state.currentMonthIndex > 0;
  const undoTooltip = canUndo
    ? 'Letzten Schritt rückgängig machen'
    : 'Keine Aktionen zum Rückgängig machen';

  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <Sidebar
        budget={state.budget}
        currentMonthIndex={state.currentMonthIndex}
        kpis={state.kpis}
        forecast={state.forecast}
        selectedAsset={selectedAsset}
        onSellAsset={handleSellAsset}
      />

      <section className="map-stage" aria-label="Bochum-Karte">
        <BochumMap
          playerAssets={state.playerAssets}
          existingAssets={state.existingAssets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={handleSelectAsset}
        />
        <BottomControls
          canUndo={canUndo}
          undoTooltip={undoTooltip}
          onUndo={handleUndo}
          onNextMonth={handleNextMonth}
        />
      </section>

      {/* Dev-only Mock State Harness Selector */}
      {import.meta.env.DEV && (
        <div className="dev-mock-harness" data-testid="dev-mock-harness">
          <label htmlFor="mock-state-select">Mock State:</label>
          <select
            id="mock-state-select"
            onChange={handleMockStateChange}
            value={
              state.gameId === 'mock-initial-game'
                ? 'initial'
                : state.gameId === 'mock-midgame-game'
                ? 'midgame'
                : 'finished'
            }
          >
            <option value="initial">Mock state: Initial</option>
            <option value="midgame">Mock state: Midgame</option>
            <option value="finished">Mock state: Finished</option>
          </select>
        </div>
      )}

      {/* Full-screen End Screen Overlay */}
      {state.status === 'finished' && state.finalScore && (
        <EndScreen finalScore={state.finalScore} onRestart={handleRestart} />
      )}
    </main>
  );
}
