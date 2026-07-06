import React from 'react';
import { createPortal } from 'react-dom';
import { AssetIconImage } from '../ui/gameAssetIcons';
import type { ItemDefinition, ItemType } from '../types/assets';

interface BuyableItemFlyoutProps {
  item: ItemDefinition;
  top: number;
  onClose: () => void;
}

const friendlyLabels: Record<ItemType, string> = {
  solar: 'Solaranlage',
  wind: 'Kleinwindanlage',
  storage: 'Energiespeicher',
};

const flyoutDescriptions: Record<ItemType, string> = {
  solar: 'Günstige Erzeugung, besonders stark in sonnigen Monaten.',
  wind: 'Hohe Erzeugung, aber nicht in allen Zonen erlaubt.',
  storage: 'Erhöht Versorgungssicherheit und hilft bei Wetterrisiken.',
};

export const BuyableItemFlyout = React.forwardRef<HTMLElement, BuyableItemFlyoutProps>(
  ({ item, top, onClose }, ref) => {
    const flyout = (
      <aside
        ref={ref}
        className="item-info-flyout"
        data-testid="item-info-flyout"
        style={{ top: `${top}px` }}
        aria-label={`${friendlyLabels[item.itemType]} Details`}
      >
        <div className="item-info-flyout__header">
          <span className="item-info-flyout__icon">
            <AssetIconImage itemType={item.itemType} size={54} />
          </span>
          <div>
            <h4 data-testid="selected-item-label">{friendlyLabels[item.itemType]}</h4>
            <p>
              Kaufpreis:{' '}
              <strong data-testid="selected-item-cost">
                {item.cost.toLocaleString('de-DE')} Euro
              </strong>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Details schließen">
            &times;
          </button>
        </div>

        <p className="item-info-flyout__description" data-testid="selected-item-description">
          {flyoutDescriptions[item.itemType]}
        </p>

        <dl className="item-info-flyout__stats">
          {item.productionValue > 0 && (
            <div>
              <dt>Erzeugung:{' '}</dt>
              <dd>{item.productionValue} MW</dd>
            </div>
          )}
          {item.storageValue > 0 && (
            <div>
              <dt>Kapazität / Sicherheitsbonus:{' '}</dt>
              <dd>{item.storageValue} MWh</dd>
            </div>
          )}
          <div>
            <dt>Betrieb:{' '}</dt>
            <dd>{item.operatingCost.toLocaleString('de-DE')} Euro/Monat</dd>
          </div>
        </dl>
      </aside>
    );

    return createPortal(flyout, document.body);
  }
);

BuyableItemFlyout.displayName = 'BuyableItemFlyout';
