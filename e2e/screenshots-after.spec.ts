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
      if (vp.name === 'mobile') {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        const drawer = page.getByRole('dialog', { name: 'Navigation Drawer' });
        await expect(drawer).toBeVisible({ timeout: 5_000 });
        await drawer.getByRole('link', { name: 'Dashboard' }).click();
      } else {
        await page.locator('a[href="/dashboard"]').first().click();
      }
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
      if (vp.name === 'mobile') {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        const drawer = page.getByRole('dialog', { name: 'Navigation Drawer' });
        await expect(drawer).toBeVisible({ timeout: 5_000 });
        await drawer.getByRole('link', { name: 'Home' }).click();
      } else {
        await page.locator('aside a[href="/"]').first().click();
      }
      await dismissHelpModal(page);
      const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
      await expect(patientSelector).toBeVisible({ timeout: 10_000 });
      await patientSelector.click();
      const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
      await expect(patientSearch).toBeVisible({ timeout: 5_000 });
      await patientSearch.fill('Wei');
      await page.waitForTimeout(300); // debounce
      await page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first().click();

      // Select at least one drug so the test panel is non-empty (required to save later).
      await page.getByText('Metoclopramide', { exact: true }).first().click();

      const proceedBtn = page.getByRole('button', { name: /Start Testing Session/i });
      await expect(proceedBtn).toBeVisible({ timeout: 5_000 });
      await proceedBtn.click();
      await page.waitForLoadState('networkidle');
      await dismissHelpModal(page);

      // ── Testing screen ───────────────────────────────────────────────────
      await page.getByRole('button', { name: 'Next Section', exact: true }).click();
      await expect(page.getByLabel(/histamine/i).first()).toBeVisible({ timeout: 10_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `testing-${vp.name}.png`), fullPage: true });

      // ── Save and capture Summary ─────────────────────────────────────────
      await page.getByLabel(/histamine/i).first().fill('5');
      // At mobile the workflow rail is a compact strip; the full section list only
      // becomes clickable inside the "All sections" sheet.
      if (vp.name === 'mobile') {
        await page.getByRole('button', { name: 'All sections' }).click();
      }
      // Two buttons share this accessible name on this section (the footer strip's
      // swapped-in Next-to-Save button, and ReviewSaveSection's own save button) — use .first().
      await page.getByRole('button', { name: /7\.\s*Review and save/i }).click();
      const saveBtn = page.getByRole('button', { name: /Save Clinical Record/i }).first();
      await expect(saveBtn).toBeVisible({ timeout: 10_000 });
      await saveBtn.click();
      await dismissHelpModal(page);
      await expect(page.getByRole('tab', { name: 'Clinical Report' })).toBeVisible({ timeout: 10_000 });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `summary-${vp.name}.png`), fullPage: true });
    });
  }
});
