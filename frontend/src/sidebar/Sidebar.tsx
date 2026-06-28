import React from 'react';
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

  const selectedItem = itemDefinitions.find((d) => d.itemType === selectedItemType);

  const handlePointerDragStartWrapper = (
    itemType: ItemType,
    pointer: { clientX: number; clientY: number }
  ) => {
    onSelectItemType?.(null); // Close the detail popover when starting a drag placement
    onPointerDragStart?.(itemType, pointer);
  };

  const handleSelectItemTypeWrapper = (itemType: ItemType) => {
    if (onSelectItemType) {
      // Toggle selection: if already selected, deselect it
      if (selectedItemType === itemType) {
        onSelectItemType(null);
      } else {
        onSelectItemType(itemType);
      }
    }
  };

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
        position: 'relative', // Enables absolute positioning for the floating card child
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
        selectedItemType={selectedItemType ?? null}
        onSelectItemType={handleSelectItemTypeWrapper}
        onPointerDragStart={handlePointerDragStartWrapper}
      />

      {/* Floating detail popover displayed to the right of the sidebar, over the map */}
      {selectedItem && (
        <div
          className="buyable-item-details-card"
          data-testid="buyable-item-details-card"
          style={{
            position: 'absolute',
            left: '350px', // Floats exactly to the right of the sidebar boundary
            top: '320px',  // Aligns next to the inventory grid Bauoptionen
            zIndex: 2000,
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd8d0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)',
            fontSize: '0.85rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f3f4f6',
              paddingBottom: '6px',
              marginBottom: '4px',
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#111827',
              }}
              data-testid="selected-item-label"
            >
              {selectedItem.itemType === 'solar'
                ? 'Solaranlage'
                : selectedItem.itemType === 'wind'
                ? 'Windmühle'
                : 'Energiespeicher'}
            </h4>
            <button
              onClick={() => onSelectItemType?.(null)}
              aria-label="Details schließen"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '1.25rem',
                lineHeight: 1,
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#9ca3af')}
            >
              &times;
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ color: '#4b5563', fontWeight: 500 }}>Kaufpreis:</span>
            <span
              style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}
              data-testid="selected-item-cost"
            >
              {selectedItem.cost.toLocaleString('de-DE')} €
            </span>
          </div>

          <p
            style={{
              margin: '4px 0',
              color: '#4b5563',
              fontSize: '0.8rem',
              lineHeight: '1.3',
            }}
            data-testid="selected-item-description"
          >
            {selectedItem.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              fontSize: '0.75rem',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '8px',
              marginTop: '4px',
            }}
          >
            {selectedItem.productionValue > 0 && (
              <div>
                <span style={{ color: '#6b7280' }}>Erzeugung: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {selectedItem.productionValue} MW
                </span>
              </div>
            )}
            {selectedItem.storageValue > 0 && (
              <div>
                <span style={{ color: '#6b7280' }}>Speicher: </span>
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {selectedItem.storageValue} MWh
                </span>
              </div>
            )}
            <div>
              <span style={{ color: '#6b7280' }}>Betrieb: </span>
              <span style={{ fontWeight: 600, color: '#111827' }}>
                {selectedItem.operatingCost.toLocaleString('de-DE')} €/M.
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
