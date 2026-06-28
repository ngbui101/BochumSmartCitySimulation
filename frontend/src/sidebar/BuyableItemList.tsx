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
    const startX = event.clientX;
    const startY = event.clientY;
    let dragStarted = false;

    // Start a timeout of 180ms. If the user keeps the pointer down, it counts as a hold-to-drag.
    const timeoutId = setTimeout(() => {
      startDrag();
    }, 180);

    const startDrag = () => {
      if (dragStarted) return;
      dragStarted = true;
      clearTimeout(timeoutId);
      onPointerDragStart?.(itemType, {
        clientX: startX,
        clientY: startY,
      });
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (dragStarted) return;
      const distance = Math.sqrt(
        (moveEvent.clientX - startX) ** 2 +
        (moveEvent.clientY - startY) ** 2
      );
      // If moved more than 6px, start drag immediately
      if (distance > 6) {
        startDrag();
      }
    };

    const handlePointerUp = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (!dragStarted) {
        // Quick click: toggle selected item type
        onSelectItemType(itemType);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
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
          backgroundColor: '#ffffff',
          padding: '12px',
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
                  backgroundColor: '#f9fafb',
                  border: '1.5px dashed #cbd8d0',
                  borderRadius: '6px',
                  opacity: 0.6,
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
                if (isDisabled) {
                  onSelectItemType(item.itemType); // Disabled item can only show info, not be dragged
                } else {
                  handlePointerDown(event, item.itemType);
                }
              }}
              title={tooltipText}
              style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? '#eef3ef' : isDisabled ? '#f3f4f6' : '#f9fafb',
                border: isSelected 
                  ? '2px solid #3d6f5a' 
                  : isDisabled 
                  ? '1.5px solid #cbd8d0' 
                  : '1.5px solid #cbd8d0',
                borderRadius: '6px',
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'grab',
                transition: 'all 0.15s ease',
                color: isDisabled ? '#9ca3af' : '#3d6f5a',
                boxShadow: isSelected ? '0 0 8px rgba(61, 111, 90, 0.4)' : 'none',
                touchAction: 'none', // Crucial for drag gestures on all devices
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
