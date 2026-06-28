import React from 'react';
import type { ItemType, PlayerAsset, ExistingAsset } from '../types/assets';
import type { GameKpis } from '../types/game';
import type { WeatherForecastMonth } from '../types/weather';
import { KpiDashboard } from './KpiDashboard';
import { WeatherForecast } from './WeatherForecast';
import { BuyableItemList } from './BuyableItemList';
import { AssetDetailsPanel } from './AssetDetailsPanel';

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
  selectedAsset?: PlayerAsset | ExistingAsset;
  onSellAsset?: (id: string) => void;
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
  selectedAsset,
  onSellAsset,
  onPointerDragStart,
}) => {
  const monthNum = currentMonthIndex + 1;
  const year = Math.floor(currentMonthIndex / 12) + 1;
  const monthInYear = (currentMonthIndex % 12) + 1;
  const monthText = `Monat ${monthNum} / 60 (Jahr ${year}, Monat ${monthInYear})`;

  return (
    <aside
      className="app-sidebar"
      aria-label="Spielstatus und Aktionen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
      }}
    >
      <header
        className="sidebar-header"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p
          className="eyebrow"
          style={{
            margin: 0,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#3d6f5a',
          }}
        >
          MVP 1
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#17211b',
          }}
        >
          Bochum Smart City
        </h1>
        <p
          className="month-display"
          data-testid="month-display"
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#526259',
          }}
        >
          {monthText}
        </p>
      </header>

      <KpiDashboard budget={budget} kpis={kpis} deltas={deltas} />

      <WeatherForecast forecast={forecast} />

      <BuyableItemList budget={budget} onPointerDragStart={onPointerDragStart} />

      <AssetDetailsPanel selectedAsset={selectedAsset} onSell={onSellAsset} />
    </aside>
  );
};
