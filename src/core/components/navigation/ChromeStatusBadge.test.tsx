import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChromeStatusBadge } from './ChromeStatusBadge';
import { expectNoAxeViolations } from '@/src/test/helpers/axe';

describe('ChromeStatusBadge', () => {
  it.each([
    [
      'draft' as const,
      'compact' as const,
      'px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0',
      'Testing draft',
      'Testing draft with unsaved changes',
    ],
    [
      'draft' as const,
      'default' as const,
      'px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0',
      'Testing draft',
      'Testing draft with unsaved changes',
    ],
    [
      'draft' as const,
      'comfortable' as const,
      'px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0',
      'Testing draft',
      'Testing draft with unsaved changes',
    ],
    [
      'report' as const,
      'compact' as const,
      'px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground rounded-none shrink-0',
      'Report active',
      'Report active',
    ],
    [
      'report' as const,
      'default' as const,
      'px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground rounded-none shrink-0',
      'Report active',
      'Report active',
    ],
    [
      'report' as const,
      'comfortable' as const,
      'px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 dark:bg-primary/30 dark:text-primary-foreground rounded-none shrink-0',
      'Report active',
      'Report active',
    ],
  ])(
    'renders variant="%s" size="%s" with exact byte-identical classes and attributes',
    (variant, size, expectedClassName, expectedText, expectedAriaLabel) => {
      const { container } = render(
        <ChromeStatusBadge variant={variant} size={size} />
      );

      const badge = screen.getByText(expectedText);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label', expectedAriaLabel);
      expect(container.firstChild).toHaveClass(expectedClassName, { exact: true });
    }
  );

  it('defaults to size="default" when size is omitted', () => {
    const { container } = render(<ChromeStatusBadge variant="draft" />);
    expect(container.firstChild).toHaveClass(
      'px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-none shrink-0',
      { exact: true }
    );
  });

  it('has zero accessibility violations', async () => {
    const { container } = render(
      <div>
        <ChromeStatusBadge variant="draft" />
        <ChromeStatusBadge variant="report" />
      </div>
    );

    await expectNoAxeViolations(container);
  });
});
