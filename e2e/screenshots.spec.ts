import { test, expect } from './fixtures';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Phase 0 baseline screenshots (T0.5). Captures the four core screens at
 * desktop and mobile viewports so later phases have a visual diff baseline.
 * Regenerate by re-running this spec; images are gitignored artifacts, not
 * committed source of truth.
 */

const OUTPUT_DIR = path.join(__dirname, 'screenshots', 'baseline');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

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

test.describe('Baseline screenshots (Phase 0)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  for (const vp of VIEWPORTS) {
    test(`captures core screens at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // ── Log screen (/) ──────────────────────────────────────────────────
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await dismissHelpModal(page);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `log-${vp.name}.png`), fullPage: true });

      // ── Dashboard ────────────────────────────────────────────────────────
      await page.locator('nav[aria-label="Primary navigation"] button[aria-label="Dashboard"]').click();
      await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10000 });
      await dismissHelpModal(page);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `dashboard-${vp.name}.png`), fullPage: true });

      // ── Back home, select seeded mock patient, proceed to testing ───────
      await page.locator('nav[aria-label="Primary navigation"] button[aria-label="Home"]').click();
      await dismissHelpModal(page);
      const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
      await expect(patientSelector).toBeVisible({ timeout: 10000 });
      await patientSelector.click();
      const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
      await expect(patientSearch).toBeVisible({ timeout: 5000 });
      await patientSearch.fill('Wei');
      await page.waitForTimeout(300); // debounce
      await page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first().click();
      const proceedBtn = page.getByRole('button', { name: /Start Testing Session/i });
      await expect(proceedBtn).toBeVisible({ timeout: 5000 });
      await proceedBtn.click();
      await page.waitForLoadState('networkidle');
      await dismissHelpModal(page);

      // ── Testing screen ───────────────────────────────────────────────────
      await expect(page.getByText('Save Clinical Record')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `testing-${vp.name}.png`), fullPage: true });

      // ── Save and capture Summary ──────────────────────────────────────────
      const histamineField = page.getByLabel(/histamine/i).first();
      if (await histamineField.isVisible()) {
        await histamineField.fill('5');
      }
      await page.getByRole('button', { name: /Save Clinical Record/i }).click();
      await dismissHelpModal(page);
      await expect(page.getByRole('tab', { name: 'Clinical Report' })).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `summary-${vp.name}.png`), fullPage: true });
    });
  }
});
