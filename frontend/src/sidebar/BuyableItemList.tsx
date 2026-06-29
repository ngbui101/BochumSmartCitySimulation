import React from 'react';
import { itemDefinitions } from '../data/itemDefinitions';
import { AssetIconImage } from '../ui/gameAssetIcons';
import { BuyableItemFlyout } from './BuyableItemFlyout';
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
  wind: 'Windkraftanlage',
  storage: 'Energiespeicher',
};

const shortDescriptions: Record<ItemType, string> = {
  solar: 'Stark in sonnigen Monaten',
  wind: 'Nicht überall erlaubt',
  storage: 'Mehr Versorgungssicherheit',
};

const itemTags: Record<ItemType, string> = {
  solar: 'Solar',
  wind: 'Wind',
  storage: 'Speicher',
};

export const BuyableItemList: React.FC<BuyableItemListProps> = ({
  budget,
  selectedItemType,
  onSelectItemType,
  onPointerDragStart,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const flyoutRef = React.useRef<HTMLElement | null>(null);
  const [flyoutTop, setFlyoutTop] = React.useState(96);
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
      if (target instanceof Node && flyoutRef.current?.contains(target)) {
        return;
      }

      onSelectItemType(null);
    };

    window.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [onSelectItemType, selectedItem]);

  React.useLayoutEffect(() => {
    if (!selectedItemType || !containerRef.current) {
      return;
    }

    const updateFlyoutTop = () => {
      const selectedCard = containerRef.current?.querySelector(
        `[data-testid="buyable-item-${selectedItemType}"]`
      );
      const rect = selectedCard?.getBoundingClientRect();
      const rawTop = rect ? rect.top - 4 : 96;
      const maxTop = Math.max(16, window.innerHeight - 340);
      setFlyoutTop(Math.min(Math.max(rawTop, 16), maxTop));
    };

    updateFlyoutTop();
    window.addEventListener('resize', updateFlyoutTop);
    window.addEventListener('scroll', updateFlyoutTop, true);

    return () => {
      window.removeEventListener('resize', updateFlyoutTop);
      window.removeEventListener('scroll', updateFlyoutTop, true);
    };
  }, [selectedItemType]);

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
            ? `Nicht genügend Budget (Benötigt: ${item.cost.toLocaleString('de-DE')} Euro, Vorhanden: ${budget.toLocaleString('de-DE')} Euro)`
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
        <BuyableItemFlyout
          item={selectedItem}
          top={flyoutTop}
          onClose={() => onSelectItemType(null)}
          ref={flyoutRef}
        />
      )}
    </div>
  );
};
