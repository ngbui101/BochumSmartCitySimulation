import React from 'react';
import type { ItemType } from '../types/assets';
import type { GameKpis, SubsidyLevel, SubsidyProgram, SubsidyState } from '../types/game';
import type { WeatherForecastMonth } from '../types/weather';
import { KpiDashboard } from './KpiDashboard';
import type { EnergyStatusProps } from './KpiDashboard';
import { WeatherForecast } from './WeatherForecast';
import { BuyableItemList } from './BuyableItemList';
import { SubsidyPanel } from './SubsidyPanel';

export interface SidebarProps {
  budget: number;
  currentMonthIndex: number;
  kpis: GameKpis;
  energyStatus: EnergyStatusProps;
  deltas?: {
    energyAutarky?: number;
    citizenSatisfaction?: number;
    supplySecurity?: number;
  };
  forecast: WeatherForecastMonth[];
  subsidies?: SubsidyState;
  subsidyCosts?: number;
  privateSolarProduction?: number;
  privateStorageDischarge?: number;
  selectedItemType?: ItemType | null;
  onSelectItemType?: (itemType: ItemType | null) => void;
  onSetSubsidyLevel?: (program: SubsidyProgram, level: SubsidyLevel) => void;
  onRequestReset?: () => void;
  onPointerDragStart?: (
    itemType: ItemType,
    pointer: {
      clientX: number;
      clientY: number;
    }
  ) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  budget,
  currentMonthIndex,
  kpis,
  energyStatus,
  deltas,
  forecast,
  subsidies = {
    solar: { level: 0, privateCapacity: 0 },
    storage: { level: 0, privateCapacity: 0 }
  },
  subsidyCosts = 0,
  privateSolarProduction = 0,
  privateStorageDischarge = 0,
  selectedItemType,
  onSelectItemType,
  onSetSubsidyLevel,
  onRequestReset,
  onPointerDragStart,
}) => {
  const monthNum = currentMonthIndex + 1;
  const year = Math.floor(currentMonthIndex / 12) + 1;
  const monthInYear = (currentMonthIndex % 12) + 1;
  const monthText = `Monat ${monthNum} / 60 (Jahr ${year}, Monat ${monthInYear})`;

  const handlePointerDragStartWrapper = (
    itemType: ItemType,
    pointer: { clientX: number; clientY: number }
  ) => {
    onSelectItemType?.(null);
    onPointerDragStart?.(itemType, pointer);
  };

  const handleSelectItemTypeWrapper = (itemType: ItemType | null) => {
    if (!onSelectItemType) {
      return;
    }

    if (!itemType || selectedItemType === itemType) {
      onSelectItemType(null);
      return;
    }

    onSelectItemType(itemType);
  };

  return (
    <aside className="app-sidebar" aria-label="Spielstatus und Aktionen">
      <header className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="mvp-badge">MVP 1</span>
          <span className="simulation-kicker">Energiewende-Simulation</span>
        </div>
        <h1>Bochum Smart City</h1>
        <p className="month-display" data-testid="month-display">
          {monthText}
        </p>
      </header>

      <KpiDashboard budget={budget} kpis={kpis} energyStatus={energyStatus} deltas={deltas} />

      <WeatherForecast forecast={forecast} />

      <SubsidyPanel
        subsidies={subsidies}
        subsidyCosts={subsidyCosts}
        privateSolarProduction={privateSolarProduction}
        privateStorageDischarge={privateStorageDischarge}
        onSetSubsidyLevel={onSetSubsidyLevel}
      />

      <BuyableItemList
        budget={budget}
        selectedItemType={selectedItemType ?? null}
        onSelectItemType={handleSelectItemTypeWrapper}
        onPointerDragStart={handlePointerDragStartWrapper}
      />

      {onRequestReset && (
        <div className="sidebar-reset-area">
          <button
            type="button"
            className="sidebar-reset-button"
            onClick={onRequestReset}
            aria-label="Spiel zurücksetzen"
          >
            <span aria-hidden="true">↻</span>
            <span>Spiel zurücksetzen</span>
          </button>
        </div>
      )}
    </aside>
  );
};
