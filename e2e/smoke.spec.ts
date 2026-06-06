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

    // Click dashboard button via the primary nav
    const dashboardButton = page.locator('nav[aria-label="Primary navigation"] button[aria-label="Dashboard"]');
    await expect(dashboardButton).toBeVisible({ timeout: 10000 });
    await dashboardButton.click();

    // Verify dashboard loads
    await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="banner"]', { timeout: 15000 });
    await dismissHelpModal(page);

    // Theme toggle is in the Menu dropdown
    const menuTrigger = page.locator('[aria-label="Menu"]').first();
    await expect(menuTrigger).toBeVisible({ timeout: 10000 });
    await menuTrigger.click();

    // Find theme toggle item (Light Mode or Dark Mode)
    const themeItem = page.locator('[role="menuitem"]').filter({ hasText: /light mode|dark mode/i }).first();
    await expect(themeItem).toBeVisible({ timeout: 5000 });
    await themeItem.click();

    // Verify theme changed (dark or light class on html)
    const htmlElement = page.locator('html');
    const hasThemeClass = await htmlElement.evaluate(el =>
      el.classList.contains('dark') || el.classList.contains('light')
    );
    expect(hasThemeClass).toBeTruthy();
  });
});
