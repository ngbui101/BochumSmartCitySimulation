import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  SolarIcon,
  WindIcon,
  StorageIcon,
  ExistingIcon,
  ConstructionBadge,
  CraneIcon,
  SelectedRing
} from '../../src/ui/icons';

describe('Icons components', () => {
  it('renders SolarIcon correctly', () => {
    const { container } = render(<SolarIcon size={32} className="text-yellow-500" />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '32');
    expect(svgElement).toHaveAttribute('height', '32');
    expect(svgElement).toHaveClass('text-yellow-500');
  });

  it('renders WindIcon correctly', () => {
    const { container } = render(<WindIcon size={24} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders StorageIcon correctly', () => {
    const { container } = render(<StorageIcon size={24} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders ExistingIcon correctly', () => {
    const { container } = render(<ExistingIcon size={24} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders ConstructionBadge correctly', () => {
    const { container } = render(<ConstructionBadge size={24} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders CraneIcon correctly', () => {
    const { container } = render(<CraneIcon size={24} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders SelectedRing correctly', () => {
    const { container } = render(<SelectedRing size={40} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '40');
  });
});
