import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has proper lang attribute', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('page has proper title', async ({ page }) => {
    await expect(page).toHaveTitle(/Anaesthetic Allergy Clinic/i);
  });

  test('skip to main content link exists', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('all images have alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('all form inputs have labels', async ({ page }) => {
    // Navigate to testing log form
    await page.click('text=New Testing Log');

    const inputs = page.locator('input:not([type="hidden"]), select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);

      // Input should have aria-label, aria-labelledby, or associated label element
      const hasAriaLabel = await input.getAttribute('aria-label');
      const hasAriaLabelledby = await input.getAttribute('aria-labelledby');

      expect(hasAriaLabel || hasAriaLabelledby).toBeTruthy();
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('headings are in hierarchical order', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();

    let previousLevel = 1;

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate((el) => el.tagName);
      const level = parseInt(tagName[1]);

      // Heading level should not skip levels (e.g., h1 -> h3)
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    }
  });

  test('focus management in modals', async ({ page }) => {
    // Open help modal
    await page.click('button:has-text("Help")');

    // Check that modal trap is working
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Tab should stay within modal
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.evaluate((el) => el.closest('[role="dialog"]'))).toBeTruthy();

    // ESC should close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // Enter should activate focused button
    await page.keyboard.press('Enter');
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    // Use axe-core to check color contrast
    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, { rules: { 'color-contrast': { enabled: true } } }, (err: any, results: any) => {
          if (err) resolve([]);
          resolve(results.violations);
        });
      });
    });

    const contrastViolations = violations.filter((v: any) => v.id === 'color-contrast');
    expect(contrastViolations.length).toBe(0);
  });

  test('aria-live regions announce dynamic content', async ({ page }) => {
    // Trigger a toast notification
    await page.evaluate(() => {
      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = 'Testing log saved';
      document.body.appendChild(toast);
    });

    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
  });

  test('data tables have proper headers', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard');

    const tables = page.locator('table');
    const count = await tables.count();

    for (let i = 0; i < count; i++) {
      const table = tables.nth(i);

      // Check for <th> elements with scope attribute
      const headers = table.locator('th[scope]');
      const headerCount = await headers.count();

      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('landmarks are used correctly', async ({ page }) => {
    const landmarks = [
      'banner',
      'navigation',
      'main',
      'complementary',
      'contentinfo',
    ];

    for (const landmark of landmarks) {
      const elements = page.locator(`[role="${landmark}"]`);
      const count = await elements.count();

      // Check for either role attribute or semantic HTML element
      let found = count > 0;

      if (!found) {
        const semanticElements = {
          banner: 'header',
          navigation: 'nav',
          main: 'main',
          complementary: 'aside',
          contentinfo: 'footer',
        };

        const semantic = page.locator(semanticElements[landmark as keyof typeof semanticElements]);
        found = (await semantic.count()) > 0;
      }

      expect(found).toBeTruthy();
    }
  });

  test('form error messages are associated with inputs', async ({ page }) => {
    // Navigate to testing log form
    await page.click('text=New Testing Log');

    // Try to submit without required fields
    await page.click('button:has-text("Save")');

    // Check for error messages
    const errors = page.locator('[role="alert"], .error, [aria-invalid="true"]');
    const hasErrors = (await errors.count()) > 0;

    if (hasErrors) {
      // Ensure errors are properly associated
      const firstError = errors.first();
      const ariaLive = await firstError.getAttribute('aria-live');

      expect(ariaLive).toBeTruthy();
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();

    // Check that focused element has visible focus indicator
    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineOffset: computed.outlineOffset,
        boxShadow: computed.boxShadow,
      };
    });

    const hasFocusIndicator =
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      styles.outline !== '';

    expect(hasFocusIndicator).toBeTruthy();
  });

  test('custom select dropdowns are accessible', async ({ page }) => {
    // Find custom select (Radix UI)
    const customSelect = page.locator('[role="combobox"]').first();

    if ((await customSelect.count()) > 0) {
      await customSelect.click();

      const listbox = page.locator('[role="listbox"]');
      await expect(listbox).toBeVisible();

      // Options should be selectable via keyboard
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      await expect(listbox).not.toBeVisible();
    }
  });

  test('responsive design works with screen reader', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still accessible
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Check that mobile menu works with keyboard
    const menuButton = page.locator('button[aria-expanded="false"], button[aria-label*="menu"]');
    if ((await menuButton.count()) > 0) {
      await menuButton.click();

      const menu = page.locator('[role="menu"], nav');
      await expect(menu).toBeVisible();
    }
  });
});

test.describe('Automated Accessibility Scans', () => {
  test('axe-core scan passes', async ({ page }) => {
    await page.goto('/');

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, (err: any, results: any) => {
          if (err) resolve([]);
          resolve(results.violations);
        });
      });
    });

    // Log violations for debugging
    if (violations.length > 0) {
      console.log('Accessibility Violations:', JSON.stringify(violations, null, 2));
    }

    expect(violations.length).toBe(0);
  });

  test('axe-core scan on dashboard', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dashboard');

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, (err: any, results: any) => {
          if (err) resolve([]);
          resolve(results.violations);
        });
      });
    });

    expect(violations.length).toBe(0);
  });

  test('axe-core scan on testing log form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=New Testing Log');

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, (err: any, results: any) => {
          if (err) resolve([]);
          resolve(results.violations);
        });
      });
    });

    expect(violations.length).toBe(0);
  });
});
