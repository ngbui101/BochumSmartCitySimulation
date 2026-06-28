import React from 'react';
import { itemDefinitions } from '../data/itemDefinitions';
import { AssetIconImage } from '../ui/gameAssetIcons';
import type { ItemType } from '../types/assets';

export interface BuyableItemListProps {
  budget: number;
  selectedItemType: ItemType | null;
  onSelectItemType: (itemType: ItemType | null) => void;
  onPointerDragStart?: (
    itemType: ItemType,
    pointer: {
      clientX: number;
      clientY: number;
    }
  ) => void;
}

const friendlyLabels: Record<ItemType, string> = {
  solar: 'Solaranlage',
  wind: 'Windmühle',
  storage: 'Energiespeicher',
};

function getPopoverOffset(itemType: ItemType): string {
  if (itemType === 'solar') {
    return '72px';
  }

  if (itemType === 'wind') {
    return '28px';
  }

  return '12px';
}

export const BuyableItemList: React.FC<BuyableItemListProps> = ({
  budget,
  selectedItemType,
  onSelectItemType,
  onPointerDragStart,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const selectedItem = itemDefinitions.find((item) => item.itemType === selectedItemType);

  React.useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current?.contains(target)) {
        return;
      }

      onSelectItemType(null);
    };

    window.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [onSelectItemType, selectedItem]);

  const handlePointerDown = (event: React.PointerEvent, itemType: ItemType) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    let dragStarted = false;

    const startDrag = () => {
      if (dragStarted) return;
      dragStarted = true;
      clearTimeout(timeoutId);
      onSelectItemType(itemType);
      onPointerDragStart?.(itemType, {
        clientX: startX,
        clientY: startY,
      });
    };

    const timeoutId = setTimeout(() => {
      startDrag();
    }, 180);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (dragStarted) return;
      const distance = Math.sqrt(
        (moveEvent.clientX - startX) ** 2 +
          (moveEvent.clientY - startY) ** 2
      );
      if (distance > 6) {
        startDrag();
      }
    };

    const handlePointerUp = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

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
      ref={containerRef}
      className="buyable-item-list"
      data-testid="buyable-item-list"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
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
              className={`inventory-slot ${isSelected ? 'selected' : ''} ${
                isDisabled ? 'disabled' : 'active'
              }`}
              data-testid={`buyable-item-${item.itemType}`}
              onPointerDown={(event) => {
                if (!isDisabled) {
                  handlePointerDown(event, item.itemType);
                }
              }}
              onClick={() => {
                if (!isDisabled) {
                  onSelectItemType(item.itemType);
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
                touchAction: 'none',
              }}
            >
              <AssetIconImage itemType={item.itemType} size={58} />
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div
          className="buyable-item-details-card"
          data-testid="buyable-item-details-card"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: getPopoverOffset(selectedItem.itemType),
            zIndex: 1200,
            width: 'min(260px, calc(100% - 24px))',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd8d0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.14), 0 4px 10px rgba(0, 0, 0, 0.08)',
            fontSize: '0.85rem',
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
              {friendlyLabels[selectedItem.itemType]}
            </h4>
            <button
              onClick={() => onSelectItemType(null)}
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
              }}
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
    </div>
  );
};
