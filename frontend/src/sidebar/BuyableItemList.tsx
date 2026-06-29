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
  wind: 'Windkraftanlage',
  storage: 'Energiespeicher',
};

const tooltipLabels: Record<ItemType, string> = {
  solar: 'Solaranlage',
  wind: 'Windmuehle',
  storage: 'Energiespeicher',
};

const shortDescriptions: Record<ItemType, string> = {
  solar: 'Stark in sonnigen Monaten',
  wind: 'Nicht ueberall erlaubt',
  storage: 'Mehr Versorgungssicherheit',
};

const itemTags: Record<ItemType, string> = {
  solar: 'Solar',
  wind: 'Wind',
  storage: 'Speicher',
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
  const items = itemDefinitions.filter((item) =>
    ['solar', 'wind', 'storage'].includes(item.itemType)
  );

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

  return (
    <div ref={containerRef} className="buyable-item-list" data-testid="buyable-item-list">
      <h3>Bauoptionen</h3>

      <div className="buyable-item-card-list" data-testid="inventory-grid">
        {items.map((item) => {
          const isSelected = selectedItemType === item.itemType;
          const isDisabled = item.cost > budget;
          const tooltipText = isDisabled
            ? `Nicht genÃ¼gend Budget (BenÃ¶tigt: ${item.cost.toLocaleString('de-DE')} Euro, Vorhanden: ${budget.toLocaleString('de-DE')} Euro)`
            : tooltipLabels[item.itemType];

          return (
            <div
              key={item.itemType}
              className={`buyable-item-card inventory-slot buyable-item-card--${item.itemType} ${
                isSelected ? 'selected' : ''
              } ${isDisabled ? 'disabled' : 'active'}`}
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
            >
              <span className="buyable-item-card__icon">
                <AssetIconImage itemType={item.itemType} size={52} />
              </span>
              <span className="buyable-item-card__body">
                <span className="buyable-item-card__topline">
                  <strong>{friendlyLabels[item.itemType]}</strong>
                  <span>{item.cost.toLocaleString('de-DE')} Euro</span>
                </span>
                <span className="buyable-item-card__description">
                  {shortDescriptions[item.itemType]}
                </span>
                <span className="buyable-item-card__tag">{itemTags[item.itemType]}</span>
              </span>
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
          }}
        >
          <div className="buyable-item-details-card__header">
            <h4 data-testid="selected-item-label">{friendlyLabels[selectedItem.itemType]}</h4>
            <button onClick={() => onSelectItemType(null)} aria-label="Details schliessen">
              &times;
            </button>
          </div>

          <div className="buyable-item-details-card__row">
            <span>Kaufpreis:</span>
            <strong data-testid="selected-item-cost">
              {selectedItem.cost.toLocaleString('de-DE')} Euro
            </strong>
          </div>

          <p data-testid="selected-item-description">{selectedItem.description}</p>

          <div className="buyable-item-details-card__stats">
            {selectedItem.productionValue > 0 && (
              <span>Erzeugung: {selectedItem.productionValue} MW</span>
            )}
            {selectedItem.storageValue > 0 && (
              <span>Speicher: {selectedItem.storageValue} MWh</span>
            )}
            <span>Betrieb: {selectedItem.operatingCost.toLocaleString('de-DE')} Euro/M.</span>
          </div>
        </div>
      )}
    </div>
  );
};
