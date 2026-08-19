import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClipboardList } from 'lucide-react';
import { StatTile } from './StatTile';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('StatTile', () => {
  it('renders label, value, and hint', () => {
    render(
      <StatTile
        label="Sessions"
        value="42"
        hint="avg 3.5 drugs/session"
      />
    );

    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toHaveClass('section-label');
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('avg 3.5 drugs/session')).toBeInTheDocument();
  });

  it('renders without hint when hint is omitted', () => {
    const { container } = render(
      <StatTile
        label="Active Records"
        value={100}
      />
    );

    expect(screen.getByText('Active Records')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(container.querySelector('.text-xs.text-muted-foreground')).toBeNull();
  });

  it('renders decorative icon with aria-hidden="true" and default primary tone', () => {
    const { container } = render(
      <StatTile
        label="Sessions"
        value="12"
        icon={<ClipboardList data-testid="test-icon" />}
      />
    );

    const icon = screen.getByTestId('test-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    const chip = container.querySelector('[aria-hidden="true"]');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('bg-primary/10', 'text-primary');
  });

  it.each([
    ['primary' as const, 'bg-primary/10', 'text-primary'],
    ['warning' as const, 'bg-status-warning/10', 'text-status-warning'],
    ['danger' as const, 'bg-status-danger/10', 'text-status-danger'],
    ['neutral' as const, 'bg-muted', 'text-muted-foreground'],
  ])('applies correct chip classes for tone="%s"', (tone, expectedBg, expectedText) => {
    const { container } = render(
      <StatTile
        label="Metrics"
        value="99"
        icon={<ClipboardList />}
        tone={tone}
      />
    );

    const chip = container.querySelector('[aria-hidden="true"]');
    expect(chip).toHaveClass(expectedBg, expectedText);
  });

  it('renders complex ReactNode value and title tooltip on label', () => {
    render(
      <StatTile
        label="Avg Onset"
        title="Average induction-to-reaction time"
        value={
          <span className="flex items-baseline gap-1">
            <span>15</span>
            <span className="text-sm">min</span>
          </span>
        }
      />
    );

    const label = screen.getByText('Avg Onset');
    expect(label).toHaveAttribute('title', 'Average induction-to-reaction time');
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
  });

  it('merges custom className onto root element', () => {
    const { container } = render(
      <StatTile
        label="Custom"
        value="1"
        className="custom-test-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-test-class');
    expect(container.firstChild).toHaveClass('border', 'border-border', 'bg-card', 'p-4');
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(
      <StatTile
        label="Drugs Tested"
        value="256"
        hint="across all sessions"
        icon={<ClipboardList />}
        tone="primary"
      />
    );

    await expectNoAxeViolations(container);
  });
});
