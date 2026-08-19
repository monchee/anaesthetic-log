import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('LoadingState', () => {
  it('renders default label "Loading..."', () => {
    render(<LoadingState />);

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('renders custom label when provided', () => {
    render(<LoadingState label="Loading content..." />);

    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('exposes an accessible loading status exactly once', () => {
    render(<LoadingState label="Loading patient details..." />);

    const statusElements = screen.getAllByRole('status');
    expect(statusElements).toHaveLength(1);
    expect(statusElements[0]).toHaveAttribute('aria-label', 'Loading');
  });

  it('supports size variants', () => {
    const { container, rerender } = render(<LoadingState size="sm" />);
    expect(container.querySelector('.w-4.h-4')).toBeInTheDocument();

    rerender(<LoadingState size="lg" />);
    expect(container.querySelector('.w-8.h-8')).toBeInTheDocument();
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(<LoadingState label="Loading records..." />);

    await expectNoAxeViolations(container);
  });
});
