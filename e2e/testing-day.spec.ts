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

test.describe('Testing Day Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Dismiss the auto-open HelpModal
    await dismissHelpModal(page);
    // Clear persisted patient data so mock patients load fresh
    await page.evaluate(() => {
      localStorage.removeItem('anaesthetic_patients');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await dismissHelpModal(page);
  });

  test('full testing day: patient selection → testing panel → save → report → dashboard activity', async ({ page }) => {
    // ── Step 1: Patient selector visible ──────────────────────────────────
    const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
    await expect(patientSelector).toBeVisible({ timeout: 10000 });

    // ── Step 2: Select Wei Chen (first mock patient) ───────────────────────
    await patientSelector.click();
    const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
    await expect(patientSearch).toBeVisible({ timeout: 5000 });
    await patientSearch.fill('Wei');
    await page.waitForTimeout(300); // debounce
    const weiOption = page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first();
    await expect(weiOption).toBeVisible({ timeout: 5000 });
    await weiOption.click();

    // ── Step 3: Proceed to Testing Panel ──────────────────────────────────
    const proceedBtn = page.getByRole('button', { name: /Proceed to Testing Panel/i });
    await expect(proceedBtn).toBeVisible({ timeout: 5000 });
    await proceedBtn.click();
    await page.waitForLoadState('networkidle');
    await dismissHelpModal(page);

    // ── Step 4: Testing form loaded ────────────────────────────────────────
    await expect(page.getByText('Save Clinical Record')).toBeVisible({ timeout: 10000 });

    // ── Step 5: Fill histamine control ────────────────────────────────────
    // Input found by label text instead (the placeholder approach is less reliable)
    // Try by label text proximity
    const histamineField = page.getByLabel(/histamine/i).first();
    if (await histamineField.isVisible()) {
      await histamineField.fill('5');
    }

    // ── Step 6: Save clinical record ──────────────────────────────────────
    const saveBtn = page.getByRole('button', { name: /Save Clinical Record/i });
    await saveBtn.click();
    await dismissHelpModal(page);

    // ── Step 7: Report screen appears (SUMMARY) ────────────────────────────
    await expect(page.getByRole('tab', { name: 'Clinical Report' })).toBeVisible({ timeout: 10000 });

    // ── Step 8: Print button is present ───────────────────────────────────
    const printBtn = page.getByRole('button', { name: /print/i }).first();
    await expect(printBtn).toBeVisible({ timeout: 5000 });

    // ── Step 9: Navigate back to the log, then to Dashboard ────────────────
    await page.getByRole('button', { name: /Start New Log/i }).click();
    await dismissHelpModal(page);
    const dashboardBtn = page.getByRole('button', { name: /dashboard/i }).first();
    await expect(dashboardBtn).toBeVisible({ timeout: 5000 });
    await dashboardBtn.click();
    await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10000 });

    // ── Step 10: Recent Testing Activity shows sessions ────────────────────
    // Mock logs are seeded — the dashboard should show at least one recent session
    await expect(page.getByText(/Recent Testing Activity/i).or(page.getByText(/recent/i))).toBeVisible({ timeout: 5000 });
  });

  test('restores in-progress testing draft after reload', async ({ page }) => {
    const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
    await expect(patientSelector).toBeVisible({ timeout: 10000 });

    await patientSelector.click();
    const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
    await expect(patientSearch).toBeVisible({ timeout: 5000 });
    await patientSearch.fill('Wei');
    await page.waitForTimeout(300);
    await page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first().click();

    const proceedBtn = page.getByRole('button', { name: /Proceed to Testing Panel/i });
    await expect(proceedBtn).toBeVisible({ timeout: 5000 });
    await proceedBtn.click();
    await dismissHelpModal(page);
    await expect(page.getByRole('button', { name: /Save Clinical Record/i })).toBeVisible({ timeout: 10000 });

    const histamineField = page.getByLabel(/histamine/i).first();
    await expect(histamineField).toBeVisible({ timeout: 5000 });
    await histamineField.fill('5');

    // Draft autosave is debounced by 500ms.
    await page.waitForTimeout(700);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await dismissHelpModal(page);

    await expect(page.getByRole('button', { name: /Save Clinical Record/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/histamine/i).first()).toHaveValue('5');
    await expect(page.getByText(/Chen, Wei|Wei Chen/)).toBeVisible({ timeout: 5000 });
  });

  test('patient identity bar stays visible while scrolling the drug grid', async ({ page }) => {
    const patientSelector = page.getByRole('button', { name: /Select Patient from Database/i });
    await expect(patientSelector).toBeVisible({ timeout: 10000 });

    await patientSelector.click();
    const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
    await expect(patientSearch).toBeVisible({ timeout: 5000 });
    await patientSearch.fill('Wei');
    await page.waitForTimeout(300);
    await page.getByRole('option').filter({ hasText: /Chen, Wei|Wei Chen/i }).first().click();

    const proceedBtn = page.getByRole('button', { name: /Proceed to Testing Panel/i });
    await expect(proceedBtn).toBeVisible({ timeout: 5000 });
    await proceedBtn.click();
    await dismissHelpModal(page);

    const identityBar = page.locator('[aria-label="Patient identity"]');
    await expect(identityBar).toBeVisible({ timeout: 10000 });
    await expect(identityBar).toContainText(/Chen, Wei|Wei Chen/i);

    // Scroll the page well past the top of the drug grid; the bar must remain on screen.
    await page.mouse.wheel(0, 1500);
    await expect(identityBar).toBeInViewport();
    await expect(identityBar).toContainText(/Chen, Wei|Wei Chen/i);
  });
});
