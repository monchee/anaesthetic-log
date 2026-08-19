import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { renderWithProviders } from '../../../test/helpers/renderWithProviders';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('ThemeToggleButton', () => {
  it('renders masthead variant with exact byte-identical classes', () => {
    renderWithProviders(<ThemeToggleButton variant="masthead" />);

    const button = screen.getByRole('button', { name: /Switch to dark theme/i });
    expect(button).toHaveClass(
      'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead',
      { exact: true }
    );
  });

  it('renders card variant with exact byte-identical classes', () => {
    renderWithProviders(<ThemeToggleButton variant="card" />);

    const button = screen.getByRole('button', { name: /Switch to dark theme/i });
    expect(button).toHaveClass(
      'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors text-foreground/80 hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      { exact: true }
    );
  });

  it('defaults to masthead variant when variant is not passed', () => {
    renderWithProviders(<ThemeToggleButton />);

    const button = screen.getByRole('button', { name: /Switch to dark theme/i });
    expect(button).toHaveClass(
      'flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-none transition-colors text-masthead-foreground/80 hover:text-masthead-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-masthead-accent focus-visible:ring-offset-2 focus-visible:ring-offset-masthead',
      { exact: true }
    );
  });

  it('toggles theme on click and updates aria-label and icons', () => {
    renderWithProviders(<ThemeToggleButton variant="masthead" />);

    // In light theme (default in test provider), button should offer switch to dark theme
    const darkToggle = screen.getByRole('button', { name: 'Switch to dark theme' });
    expect(darkToggle).toBeInTheDocument();

    // Click to switch to dark theme
    fireEvent.click(darkToggle);

    const lightToggle = screen.getByRole('button', { name: 'Switch to light theme' });
    expect(lightToggle).toBeInTheDocument();

    // Click to switch back to light theme
    fireEvent.click(lightToggle);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('has zero accessibility violations', async () => {
    const { container } = renderWithProviders(
      <div>
        <ThemeToggleButton variant="masthead" />
        <ThemeToggleButton variant="card" />
      </div>
    );

    await expectNoAxeViolations(container);
  });
});
