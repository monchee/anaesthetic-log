import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertTriangle } from 'lucide-react';
import { ErrorState } from './ErrorState';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('ErrorState', () => {
  it('renders title as an h2 heading', () => {
    render(<ErrorState title="Something went wrong" />);

    expect(screen.getByRole('heading', { name: 'Something went wrong', level: 2 })).toBeInTheDocument();
  });

  it('renders children content and actions', () => {
    render(
      <ErrorState
        title="Unable to load this section"
        actions={
          <button type="button">Retry</button>
        }
      >
        <p>A network interruption occurred.</p>
      </ErrorState>
    );

    expect(screen.getByText('A network interruption occurred.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('marks decorative icon as aria-hidden="true"', () => {
    const { container } = render(
      <ErrorState
        icon={<AlertTriangle data-testid="error-icon" />}
        title="Application Error"
      />
    );

    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(
      <ErrorState
        icon={<AlertTriangle />}
        title="Something went wrong"
        actions={<button type="button">Try Again</button>}
      >
        <p>An unexpected error occurred. Don't worry, your data is safe.</p>
      </ErrorState>
    );

    await expectNoAxeViolations(container);
  });
});
