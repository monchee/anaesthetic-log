import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Default axe-core configuration for unit tests.
 *
 * Blind spot note: The application's design system uses CSS4 space-syntax
 * HSL custom properties (e.g., `hsl(var(--token))`). axe-core running in jsdom
 * cannot compute computed background/foreground styles from CSS custom properties,
 * causing false positives for the color-contrast rule. Therefore, color-contrast
 * is disabled here (matching the e2e scan configuration in e2e/accessibility.spec.ts).
 */
export const defaultAxeOptions: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
  },
};

/**
 * Runs axe-core analysis on a given DOM node or document.
 */
export async function runAxe(
  container: Element | Document = document.body,
  options: axe.RunOptions = defaultAxeOptions
): Promise<axe.AxeResults> {
  return axe.run(container, options);
}

/**
 * Formats axe violation details into a human-readable failure message.
 */
function formatViolations(violations: axe.Result[]): string {
  if (violations.length === 0) return '';
  return violations
    .map((v, i) => {
      const targets = v.nodes.map(n => `  - Target: ${n.target.join(', ')}\n    HTML: ${n.html}`).join('\n');
      return `${i + 1}. [${v.id}] ${v.help} (impact: ${v.impact})\n   Help URL: ${v.helpUrl}\n${targets}`;
    })
    .join('\n\n');
}

/**
 * Asserts that a rendered element has zero accessibility violations.
 */
export async function expectNoAxeViolations(
  container: Element | Document = document.body,
  options: axe.RunOptions = defaultAxeOptions
): Promise<void> {
  const results = await runAxe(container, options);
  const violations = results.violations;
  if (violations.length > 0) {
    const message = `Expected no accessibility violations, but found ${violations.length}:\n\n${formatViolations(violations)}`;
    throw new Error(message);
  }
  expect(violations).toHaveLength(0);
}

// Vitest custom matcher extension
interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveNoViolations(results: axe.AxeResults) {
    const violations = results.violations || [];
    const pass = violations.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? 'Expected accessibility violations, but found none.'
          : `Expected no accessibility violations, but found ${violations.length}:\n\n${formatViolations(violations)}`,
    };
  },
});
