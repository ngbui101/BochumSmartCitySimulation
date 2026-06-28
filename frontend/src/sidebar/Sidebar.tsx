import React, { useState } from 'react';
import type { ItemType } from '../types/assets';
import type { GameKpis } from '../types/game';
import type { WeatherForecastMonth } from '../types/weather';
import { KpiDashboard } from './KpiDashboard';
import { WeatherForecast } from './WeatherForecast';
import { BuyableItemList } from './BuyableItemList';
import { itemDefinitions } from '../data/itemDefinitions';

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
  onPointerDragStart,
}) => {
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);

  const monthNum = currentMonthIndex + 1;
  const year = Math.floor(currentMonthIndex / 12) + 1;
  const monthInYear = (currentMonthIndex % 12) + 1;
  const monthText = `Monat ${monthNum} / 60 (Jahr ${year}, Monat ${monthInYear})`;

  const selectedItem = itemDefinitions.find((d) => d.itemType === selectedItemType);

  return (
    <aside
      className="app-sidebar"
      aria-label="Spielstatus und Aktionen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px 20px',
        color: '#17211b',
        background: '#f7faf7',
        borderRight: '1px solid #cbd8d0',
        height: '100%',
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

      <BuyableItemList
        budget={budget}
        selectedItemType={selectedItemType}
        onSelectItemType={setSelectedItemType}
        onPointerDragStart={onPointerDragStart}
      />

      {selectedItem && (
        <div
          className="buyable-item-details-card"
          data-testid="buyable-item-details-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd8d0',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            fontSize: '0.85rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }} data-testid="selected-item-label">
              {selectedItem.itemType === 'solar' ? 'Solaranlage' : selectedItem.itemType === 'wind' ? 'Windmühle' : 'Energiespeicher'}
            </h4>
            <span style={{ fontWeight: 700, color: '#059669' }} data-testid="selected-item-cost">
              {selectedItem.cost.toLocaleString('de-DE')} €
            </span>
          </div>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '0.8rem', lineHeight: '1.3' }} data-testid="selected-item-description">
            {selectedItem.description}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', borderTop: '1px solid #f3f4f6', paddingTop: '6px', marginTop: '2px' }}>
            {selectedItem.productionValue > 0 && (
              <div>
                <span style={{ color: '#6b7280' }}>Erzeugung: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedItem.productionValue} MW</span>
              </div>
            )}
            {selectedItem.storageValue > 0 && (
              <div>
                <span style={{ color: '#6b7280' }}>Speicher: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedItem.storageValue} MWh</span>
              </div>
            )}
            <div>
              <span style={{ color: '#6b7280' }}>Betrieb: </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{selectedItem.operatingCost.toLocaleString('de-DE')} €/M.</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
