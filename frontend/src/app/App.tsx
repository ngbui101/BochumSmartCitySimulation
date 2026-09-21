import React, { useMemo, useState } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { BochumMap } from '../map/BochumMap';
import { BottomControls } from '../components/BottomControls';
import { ResetConfirmationModal } from '../components/ResetConfirmationModal';
import { QuickStart } from '../components/QuickStart';
import type { QuickStartTarget } from '../components/QuickStart';
import { EndScreen } from '../sidebar/EndScreen';
import { getUndoTooltip, getCurrentMonthlyBalance } from '../game/selectors';
import { calculateFinalScore } from '../simulation/scoring';
import { useAppState } from './appState';
import {
  completeQuickStart,
  hasCompletedQuickStart
} from '../persistence/quickStartStore';
import { AssetIconImage } from '../ui/gameAssetIcons';
import type {
  FinalScore,
  GameKpis,
  GameState,
  SubsidyLevel,
  SubsidyProgram
} from '../types/game';
import { getItemLabel, usePlacement } from './usePlacement';

function getKpiDeltas(state: GameState):
  | {
      energyAutarky?: number;
      citizenSatisfaction?: number;
      supplySecurity?: number;
    }
  | undefined {
  const previousMonth = state.monthlyHistory[state.monthlyHistory.length - 1];

  if (!previousMonth) {
    return undefined;
  }

  return {
    energyAutarky: state.kpis.energyAutarky - previousMonth.kpis.energyAutarky,
    citizenSatisfaction: state.kpis.citizenSatisfaction - previousMonth.kpis.citizenSatisfaction,
    supplySecurity: state.kpis.supplySecurity - previousMonth.kpis.supplySecurity
  };
}

function hasCurrentScoreFormat(score: FinalScore | undefined): score is FinalScore {
  if (!score) {
    return false;
  }

  return [
    score.breakdown.budgetPoints,
    score.breakdown.energyAutarkyPoints,
    score.breakdown.citizenSatisfactionPoints,
    score.breakdown.supplySecurityPoints
  ].every((value) => typeof value === 'number');
}

export function App() {
  const {
    state,
    dispatch,
    resetGame,
    storageStatus
  } = useAppState();
  const {
    placementDrag, selectedItemType, setSelectedItemType, zoneFeedback,
    placementFeedback, placeableZones, clearPlacementFeedback, cancelDrag,
    resetPlacement, handlePointerDragStart, handleDragPosition, handleDropAsset,
    handleDropOutside, handleDragLeave
  } = usePlacement(state, dispatch);
  const [resetVersion, setResetVersion] = useState(0);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(
    () => state.status === 'running' && !hasCompletedQuickStart()
  );
  const [onboardingTarget, setOnboardingTarget] = useState<QuickStartTarget | null>(null);

  const handleSelectAsset = (id: string | undefined) => {
    dispatch(id ? { type: 'SELECT_ASSET', assetId: id } : { type: 'CLEAR_SELECTION' });
  };

  const handleSellAsset = (id: string) => {
    clearPlacementFeedback();
    dispatch({ type: 'SELL_ASSET', assetId: id });
  };

  const handleUndo = () => {
    clearPlacementFeedback();
    dispatch({ type: 'UNDO_LAST_ACTION' });
  };

  const handleNextMonth = () => {
    clearPlacementFeedback();
    cancelDrag();
    dispatch({ type: 'ADVANCE_MONTH' });
  };

  const handleSetSubsidyLevel = (program: SubsidyProgram, level: SubsidyLevel) => {
    dispatch({ type: 'SET_SUBSIDY_LEVEL', program, level });
  };

  const handleRestart = () => {
    resetPlacement();
    setResetVersion((version) => version + 1);
    setOnboardingTarget(null);
    setIsQuickStartOpen(true);

    resetGame();
  };

  const handleQuickStartComplete = () => {
    completeQuickStart();
    setOnboardingTarget(null);
    setIsQuickStartOpen(false);
  };

  const handleResetRequest = () => {
    setIsResetConfirmationOpen(true);
  };

  const handleResetCancel = () => {
    setIsResetConfirmationOpen(false);
  };

  const handleResetConfirm = () => {
    setIsResetConfirmationOpen(false);
    handleRestart();
  };

  const canUndo = state.undoStack.length > 0;
  const undoTooltip = getUndoTooltip(state);
  const deltas: Partial<GameKpis> | undefined = getKpiDeltas(state);
  const finalScore =
    state.status === 'finished' || state.status === 'lost'
      ? hasCurrentScoreFormat(state.finalScore)
        ? state.finalScore
        : calculateFinalScore(state)
      : undefined;

  const balance = useMemo(() => getCurrentMonthlyBalance(state), [state]);

  return (
    <main className="app-shell" aria-label="Bochum Smart City Simulation">
      <Sidebar
        budget={state.budget}
        currentMonthIndex={state.currentMonthIndex}
        kpis={state.kpis}
        energyStatus={{
          energySaldo: balance.saldo,
          importCost: state.currentMonthIndex === 0 ? 0 : balance.importCost,
          storedEnergy: state.storedEnergy,
          storageCapacity: balance.storageCapacity,
          isGracePeriod: state.currentMonthIndex === 0,
          netMonthlyDelta: balance.netMonthlyDelta,
          revenueFromSales: balance.revenueFromSales
        }}
        deltas={deltas}
        forecast={state.forecast}
        subsidies={state.subsidies}
        subsidyCosts={balance.subsidyCosts}
        privateSolarProduction={balance.privateSolarProduction}
        privateStorageDischarge={balance.privateStorageDischarge}
        selectedItemType={selectedItemType}
        onSelectItemType={setSelectedItemType}
        onSetSubsidyLevel={handleSetSubsidyLevel}
        onRequestReset={handleResetRequest}
        onPointerDragStart={handlePointerDragStart}
        onboardingTarget={onboardingTarget}
      />

      <section className="map-stage" aria-label="Bochum-Karte">
        {storageStatus === 'unavailable' && (
          <div className="storage-warning" role="status" data-testid="storage-warning">
            Der Spielstand kann in diesem Browser nicht gespeichert werden. Das Spiel läuft weiter,
            kann aber beim Aktualisieren der Seite verloren gehen.
          </div>
        )}
        <BochumMap
          key={resetVersion}
          playerAssets={state.playerAssets}
          existingAssets={state.existingAssets}
          privateAssets={state.privateAssets}
          selectedAssetId={state.selectedAssetId}
          onSelectAsset={handleSelectAsset}
          onSell={handleSellAsset}
          zoneFeedback={zoneFeedback}
          placementFeedback={placementFeedback}
          placementDrag={placementDrag}
          onDragPosition={handleDragPosition}
          onDropAsset={handleDropAsset}
          onDropOutside={handleDropOutside}
          onDragLeave={handleDragLeave}
          placeableZones={placeableZones}
        />
        <BottomControls
          canUndo={canUndo}
          undoTooltip={undoTooltip}
          onUndo={handleUndo}
          onNextMonth={handleNextMonth}
        />
      </section>

      {placementDrag && (
        <div
          className="placement-drag-preview"
          data-testid="placement-drag-preview"
          style={{
            transform: `translate(${placementDrag.clientX + 12}px, ${
              placementDrag.clientY + 12
            }px)`
          }}
        >
          <span className="placement-drag-preview-icon"><AssetIconImage itemType={placementDrag.itemType} size={64} /></span>
          <span>{getItemLabel(placementDrag.itemType)}</span>
        </div>
      )}

      {finalScore && (
        <EndScreen
          finalScore={finalScore}
          status={state.status}
          lossReason={state.lossReason}
          onRestart={handleRestart}
        />
      )}

      <QuickStart
        isOpen={isQuickStartOpen}
        onComplete={handleQuickStartComplete}
        onTargetChange={setOnboardingTarget}
      />

      <ResetConfirmationModal
        isOpen={isResetConfirmationOpen}
        onCancel={handleResetCancel}
        onConfirm={handleResetConfirm}
      />
    </main>
  );
}
