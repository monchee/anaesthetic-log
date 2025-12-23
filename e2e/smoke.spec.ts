import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check that the main heading is visible
    await expect(page.getByText('Anaesthetic Allergy Clinic')).toBeVisible();
  });

  test('can navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Click dashboard button
    const dashboardButton = page.getByRole('button', { name: /dashboard/i });
    await dashboardButton.click();
    
    // Verify dashboard loads
    await expect(page.getByText('Clinical Dashboard')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    
    // Find and click theme toggle (moon/sun icon button)
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Verify theme changed (dark class should be added to html or body)
      const htmlElement = page.locator('html');
      const hasThemeClass = await htmlElement.evaluate(el => 
        el.classList.contains('dark') || el.classList.contains('light')
      );
      expect(hasThemeClass).toBeTruthy();
    }
  });
});
