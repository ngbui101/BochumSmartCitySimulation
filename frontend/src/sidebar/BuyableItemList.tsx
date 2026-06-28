import React from 'react';
import { itemDefinitions } from '../data/itemDefinitions';
import { SolarIcon, WindIcon, StorageIcon } from '../ui/icons';
import type { ItemType } from '../types/assets';

export interface BuyableItemListProps {
  budget: number;
  selectedItemType: ItemType | null;
  onSelectItemType: (itemType: ItemType) => void;
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

const friendlyLabels: Record<ItemType, string> = {
  solar: 'Solaranlage',
  wind: 'Windmühle',
  storage: 'Energiespeicher',
};

export const BuyableItemList: React.FC<BuyableItemListProps> = ({
  budget,
  selectedItemType,
  onSelectItemType,
  onPointerDragStart,
}) => {
  const handlePointerDown = (event: React.PointerEvent, itemType: ItemType) => {
    event.preventDefault();
    onPointerDragStart?.(itemType, {
      clientX: event.clientX,
      clientY: event.clientY
    });
  };

  // Define 6 slots total (3 items, 3 empty slots for visual RPG inventory grid style)
  const slots = [
    itemDefinitions.find((d) => d.itemType === 'solar'),
    itemDefinitions.find((d) => d.itemType === 'wind'),
    itemDefinitions.find((d) => d.itemType === 'storage'),
    null,
    null,
    null,
  ];

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
        className="inventory-grid"
        data-testid="inventory-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          backgroundColor: '#17211b',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #cbd8d0',
        }}
      >
        {slots.map((item, index) => {
          if (!item) {
            return (
              <div
                key={`empty-${index}`}
                className="inventory-slot-empty"
                style={{
                  aspectRatio: '1 / 1',
                  backgroundColor: '#0c120f',
                  border: '1.5px dashed #3d6f5a',
                  borderRadius: '6px',
                  opacity: 0.3,
                }}
              />
            );
          }

          const isSelected = selectedItemType === item.itemType;
          const isDisabled = item.cost > budget;
          const labelText = friendlyLabels[item.itemType] || item.label;
          const tooltipText = isDisabled
            ? `Nicht genügend Budget (Benötigt: ${item.cost.toLocaleString('de-DE')} Euro, Vorhanden: ${budget.toLocaleString('de-DE')} Euro)`
            : labelText;

          return (
            <div
              key={item.itemType}
              className={`inventory-slot ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : 'active'}`}
              data-testid={`buyable-item-${item.itemType}`}
              onPointerDown={(event) => {
                onSelectItemType(item.itemType);
                if (!isDisabled) {
                  handlePointerDown(event, item.itemType);
                }
              }}
              title={tooltipText}
              style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? '#3d6f5a' : isDisabled ? '#2c3531' : '#24332c',
                border: isSelected 
                  ? '2px solid #22c55e' 
                  : isDisabled 
                  ? '1.5px solid #526259' 
                  : '1.5px solid #cbd8d0',
                borderRadius: '6px',
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'not-allowed' : 'grab',
                transition: 'all 0.15s ease',
                color: isDisabled ? '#6b7280' : '#ffffff',
                boxShadow: isSelected ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
              }}
            >
              {itemIcons[item.itemType]}
            </div>
          );
        })}
      </div>
    </div>
  );
};
