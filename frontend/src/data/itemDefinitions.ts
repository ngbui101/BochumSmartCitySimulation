import type { ItemDefinition } from '../types/assets';

export const itemDefinitions: ItemDefinition[] = [
  {
    itemType: 'solar',
    label: 'Solaranlage',
    description: 'Guenstige Erzeugung, besonders stark in sonnigen Monaten.',
    standardSizeLabel: 'Standard-Solaranlage',
    cost: 1_200_000,
    buildTimeMonths: 1,
    productionValue: 7,
    storageValue: 0,
    operatingCost: 35_000,
    citizenSatisfactionImpact: 1,
    balancingSource: 'mvp-playtest-value'
  },
  {
    itemType: 'wind',
    label: 'Kleinwindanlage',
    description: 'Hohe Erzeugung, staerker in windigen und winterlichen Monaten.',
    standardSizeLabel: 'Standard-Kleinwindanlage',
    cost: 2_800_000,
    buildTimeMonths: 1,
    productionValue: 14,
    storageValue: 0,
    operatingCost: 80_000,
    citizenSatisfactionImpact: -3,
    balancingSource: 'mvp-playtest-value'
  },
  {
    itemType: 'storage',
    label: 'Energiespeicher',
    description: 'Erzeugt keinen Strom, verbessert aber Robustheit und Versorgungssicherheit.',
    standardSizeLabel: 'Standard-Energiespeicher',
    cost: 1_700_000,
    buildTimeMonths: 1,
    productionValue: 0,
    storageValue: 10,
    operatingCost: 45_000,
    citizenSatisfactionImpact: 0,
    balancingSource: 'mvp-playtest-value'
  }
];
