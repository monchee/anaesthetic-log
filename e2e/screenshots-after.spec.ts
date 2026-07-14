import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { dismissHelpModal, expect, test } from './fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Phase 4 "after" screenshots (T4.4). Mirrors the Phase 0 baseline flow and
 * viewports so reviewers can visually compare the UI added during Phases 1-3.
 * Images are regenerable, gitignored artifacts rather than committed source.
 */

const OUTPUT_DIR = path.join(__dirname, 'screenshots', 'after');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('After screenshots (Phases 1-3)', () => {
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
      await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('group', { name: 'Worklist filters' })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('button', { name: /View details for patient:/ }).first()).toBeVisible({ timeout: 10_000 });
      await dismissHelpModal(page);
      await page.waitForTimeout(1_200); // let staggered rows and count-up metrics finish
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `dashboard-${vp.name}.png`),
        fullPage: true,
        animations: 'disabled',
      });

      // ── Back home, select seeded mock patient, proceed to testing ───────
      await page.locator('nav[aria-label="Primary navigation"] button[aria-label="Home"]').click();
      await dismissHelpModal(page);
      const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
      await expect(patientSelector).toBeVisible({ timeout: 10_000 });
      await patientSelector.click();
      const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
      await expect(patientSearch).toBeVisible({ timeout: 5_000 });
      await patientSearch.fill('Wei');
      await page.waitForTimeout(300); // debounce
      await page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first().click();
      const proceedBtn = page.getByRole('button', { name: /Start Testing Session/i });
      await expect(proceedBtn).toBeVisible({ timeout: 5_000 });
      await proceedBtn.click();
      await page.waitForLoadState('networkidle');
      await dismissHelpModal(page);

      // ── Testing screen ───────────────────────────────────────────────────
      await expect(page.getByText('Save Clinical Record')).toBeVisible({ timeout: 10_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `testing-${vp.name}.png`), fullPage: true });

      // ── Save and capture Summary ─────────────────────────────────────────
      const histamineField = page.getByLabel(/histamine/i).first();
      if (await histamineField.isVisible()) {
        await histamineField.fill('5');
      }
      await page.getByRole('button', { name: /Save Clinical Record/i }).click();
      await dismissHelpModal(page);
      await expect(page.getByRole('tab', { name: 'Clinical Report' })).toBeVisible({ timeout: 10_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `summary-${vp.name}.png`), fullPage: true });
    });
  }
});
