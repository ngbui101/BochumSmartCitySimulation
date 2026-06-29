import React from 'react';
import type { ItemType } from '../types/assets';
import type { GameKpis } from '../types/game';
import type { WeatherForecastMonth } from '../types/weather';
import { KpiDashboard } from './KpiDashboard';
import { WeatherForecast } from './WeatherForecast';
import { BuyableItemList } from './BuyableItemList';

export interface SidebarProps {
  budget: number;
  currentMonthIndex: number;
  kpis: GameKpis;
  deltas?: {
    energyAutarky?: number;
    citizenSatisfaction?: number;
    supplySecurity?: number;
  };
  forecast: WeatherForecastMonth[];
  selectedItemType?: ItemType | null;
  onSelectItemType?: (itemType: ItemType | null) => void;
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
  deltas,
  forecast,
  selectedItemType,
  onSelectItemType,
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

      <KpiDashboard budget={budget} kpis={kpis} deltas={deltas} />

      <WeatherForecast forecast={forecast} />

      <BuyableItemList
        budget={budget}
        selectedItemType={selectedItemType ?? null}
        onSelectItemType={handleSelectItemTypeWrapper}
        onPointerDragStart={handlePointerDragStartWrapper}
      />
    </aside>
  );
};
