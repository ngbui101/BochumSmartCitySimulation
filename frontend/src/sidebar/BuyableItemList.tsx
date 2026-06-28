import React from 'react';
import { itemDefinitions } from '../data/itemDefinitions';
import { SolarIcon, WindIcon, StorageIcon } from '../ui/icons';
import type { ItemType } from '../types/assets';

export interface BuyableItemListProps {
  budget: number;
  onPointerDragStart?: (
    itemType: ItemType,
    pointer: {
      clientX: number;
      clientY: number;
    }
  ) => void;
}

const itemIcons: Record<ItemType, React.ReactNode> = {
  solar: <SolarIcon size={24} />,
  wind: <WindIcon size={24} />,
  storage: <StorageIcon size={24} />,
};

// Friendly labels with German umlauts
const friendlyLabels: Record<ItemType, string> = {
  solar: 'Solaranlage',
  wind: 'Windmühle',
  storage: 'Energiespeicher',
};

export const BuyableItemList: React.FC<BuyableItemListProps> = ({
  budget,
  onPointerDragStart,
}) => {
  const handlePointerDown = (event: React.PointerEvent, itemType: ItemType) => {
    event.preventDefault();
    onPointerDragStart?.(itemType, {
      clientX: event.clientX,
      clientY: event.clientY
    });
  };

  return (
    <div
      className="buyable-item-list"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#3d6f5a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Bauoptionen
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {itemDefinitions.map((item) => {
          const isDisabled = item.cost > budget;
          const tooltipText = isDisabled
            ? `Nicht genügend Budget (Benötigt: ${item.cost.toLocaleString('de-DE')} Euro, Vorhanden: ${budget.toLocaleString('de-DE')} Euro)`
            : undefined;
          
          const labelText = friendlyLabels[item.itemType] || item.label;

          return (
            <div
              key={item.itemType}
              className={`buyable-item-card ${isDisabled ? 'disabled' : 'active'}`}
              data-testid={`buyable-item-${item.itemType}`}
              onPointerDown={(event) => {
                if (!isDisabled) {
                  handlePointerDown(event, item.itemType);
                }
              }}
              title={tooltipText}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                backgroundColor: isDisabled ? '#f3f4f6' : '#ffffff',
                border: isDisabled ? '1px dashed #cbd5e0' : '1px solid #d7e2da',
                borderRadius: '8px',
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'grab',
                transition: 'all 0.2s ease',
                userSelect: isDisabled ? 'none' : 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDisabled ? '#9ca3af' : '#3d6f5a',
                  width: '40px',
                  height: '40px',
                  backgroundColor: isDisabled ? '#e5e7eb' : '#f0fdf4',
                  borderRadius: '6px',
                  flexShrink: 0,
                }}
              >
                {itemIcons[item.itemType]}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flexGrow: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    className="item-label"
                    data-testid="item-label"
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: isDisabled ? '#6b7280' : '#111827',
                    }}
                  >
                    {labelText}
                  </span>
                  <span
                    className="item-cost"
                    data-testid="item-cost"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isDisabled ? '#9ca3af' : '#059669',
                    }}
                  >
                    {item.cost.toLocaleString('de-DE')} €
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    lineHeight: '1.2',
                  }}
                >
                  {item.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
