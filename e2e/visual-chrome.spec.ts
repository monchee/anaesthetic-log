import { test, expect } from './fixtures';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800, isDesktop: true },
  { name: 'mobile', width: 390, height: 844, isDesktop: false },
] as const;

test.describe('Navigation Chrome Visual Regression', () => {
  for (const vp of VIEWPORTS) {
    test(`captures navigation chrome on / at ${vp.name} @visual`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const topBar = page.getByRole('banner');
      await expect(topBar).toBeVisible();
      await expect(topBar).toHaveScreenshot(`${vp.name}-topbar-root.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });

      if (vp.isDesktop) {
        const sidebar = page.getByRole('complementary', { name: /Application sidebar/i });
        await expect(sidebar).toBeVisible();
        await expect(sidebar).toHaveScreenshot(`${vp.name}-sidebar-root.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        });
      }
    });

    test(`captures navigation chrome on /dashboard at ${vp.name} @visual`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const topBar = page.getByRole('banner');
      await expect(topBar).toBeVisible();
      await expect(topBar).toHaveScreenshot(`${vp.name}-topbar-dashboard.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });

      if (vp.isDesktop) {
        const sidebar = page.getByRole('complementary', { name: /Application sidebar/i });
        await expect(sidebar).toBeVisible();
        await expect(sidebar).toHaveScreenshot(`${vp.name}-sidebar-dashboard.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        });
      }
    });
  }
});
