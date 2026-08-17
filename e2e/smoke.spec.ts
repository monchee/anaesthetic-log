import { test, expect } from './fixtures';

/**
 * Dismiss the HelpModal "Quick Start" dialog that auto-opens in demo mode.
 */
async function dismissHelpModal(page: any) {
  await page.waitForTimeout(400);
  const dialog = page.locator('[role="dialog"]');
  const isDialogVisible = await dialog.isVisible().catch(() => false);
  if (!isDialogVisible) return;
  const skipBtn = dialog.locator('button', { hasText: /skip for now/i });
  const gotItBtn = dialog.locator('button', { hasText: /got it/i });
  for (const btn of [skipBtn, gotItBtn]) {
    const count = await btn.count();
    if (count > 0) {
      try {
        await btn.first().waitFor({ state: 'stable', timeout: 3000 });
        await btn.first().click({ timeout: 5000 });
        await dialog.waitFor({ state: 'hidden', timeout: 5000 });
        return;
      } catch { /* try next */ }
    }
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

test.describe('Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // The app title is DREAM — check the h1 in the header
    await expect(page.locator('header h1')).toContainText('DREAM');
  });

  test('can navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="banner"]', { timeout: 15000 });
    await dismissHelpModal(page);

    // Click dashboard link via primary nav
    const dashboardLink = page.locator('a[href="/dashboard"]').first();
    await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    await dashboardLink.click();

    // Verify dashboard loads
    await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="banner"]', { timeout: 15000 });
    await dismissHelpModal(page);

    // Theme toggle is in the AppTopBar across all viewports
    const themeButton = page.locator('button[aria-label^="Switch to"]').first();
    await expect(themeButton).toBeVisible({ timeout: 5000 });
    await themeButton.click();

    // Verify theme changed (dark or light class on html)
    const htmlElement = page.locator('html');
    const hasThemeClass = await htmlElement.evaluate(el =>
      el.classList.contains('dark') || el.classList.contains('light')
    );
    expect(hasThemeClass).toBeTruthy();
  });
});
