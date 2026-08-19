import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Upload } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('EmptyState', () => {
  it('renders title, description, and action', () => {
    render(
      <EmptyState
        title="No records found"
        description="Try adjusting your search criteria."
        action={<button type="button">Reset Filters</button>}
      />
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeInTheDocument();
  });

  it('marks decorative icon with aria-hidden="true"', () => {
    const { container } = render(
      <EmptyState
        icon={<Upload data-testid="upload-icon" />}
        title="No data loaded"
      />
    );

    const iconElement = container.querySelector('[aria-hidden="true"]');
    expect(iconElement).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  it('renders sm size variant with compact styling', () => {
    const { container } = render(
      <EmptyState
        size="sm"
        title="Compact empty state"
      />
    );

    expect(container.firstChild).toHaveClass('py-4');
  });

  it('renders md size variant by default with standard py-10 padding', () => {
    const { container } = render(
      <EmptyState
        title="Default empty state"
      />
    );

    expect(container.firstChild).toHaveClass('py-10');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(
      <EmptyState
        icon={<Upload />}
        title="No patient data loaded"
        description="Upload a REDCap CSV to get started."
        action={<button type="button">Upload</button>}
      />
    );

    await expectNoAxeViolations(container);
  });
});
