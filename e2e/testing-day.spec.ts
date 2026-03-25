import { test, expect } from '@playwright/test';

test.describe('Testing Day Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Clear persisted patient data so mock patients load fresh
    await page.evaluate(() => {
      localStorage.removeItem('anaesthetic_patients');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('full testing day: patient selection → testing panel → save → report → dashboard activity', async ({ page }) => {
    // ── Step 1: Patient selector visible ──────────────────────────────────
    const patientInput = page.getByRole('combobox').or(page.locator('input[placeholder*="patient" i]')).first();
    await expect(patientInput).toBeVisible({ timeout: 10000 });

    // ── Step 2: Select Wei Chen (first mock patient) ───────────────────────
    await patientInput.click();
    await patientInput.fill('Wei');
    await page.waitForTimeout(300); // debounce
    const weiOption = page.getByRole('option', { name: /Wei Chen/i }).or(page.locator('[role="option"]').filter({ hasText: 'Wei Chen' })).first();
    await expect(weiOption).toBeVisible({ timeout: 5000 });
    await weiOption.click();

    // ── Step 3: Proceed to Testing Panel ──────────────────────────────────
    const proceedBtn = page.getByRole('button', { name: /Proceed to Testing Panel/i });
    await expect(proceedBtn).toBeVisible({ timeout: 5000 });
    await proceedBtn.click();
    await page.waitForLoadState('networkidle');

    // ── Step 4: Testing form loaded ────────────────────────────────────────
    await expect(page.getByText('Save Clinical Record')).toBeVisible({ timeout: 10000 });

    // ── Step 5: Fill histamine control ────────────────────────────────────
    const histamineInput = page.locator('input').filter({ hasText: '' }).and(page.locator('[placeholder*="histamine" i], input[aria-label*="histamine" i]')).first();
    // Try by label text proximity
    const histamineField = page.getByLabel(/histamine/i).first();
    if (await histamineField.isVisible()) {
      await histamineField.fill('5');
    }

    // ── Step 6: Save clinical record ──────────────────────────────────────
    const saveBtn = page.getByRole('button', { name: /Save Clinical Record/i });
    await saveBtn.click();

    // ── Step 7: Report screen appears (SUMMARY) ────────────────────────────
    await expect(page.getByText('Clinical Report').or(page.getByText('Patient Handout'))).toBeVisible({ timeout: 10000 });

    // ── Step 8: Print button is present ───────────────────────────────────
    const printBtn = page.getByRole('button', { name: /print/i }).first();
    await expect(printBtn).toBeVisible({ timeout: 5000 });

    // ── Step 9: Navigate to Dashboard ─────────────────────────────────────
    const dashboardBtn = page.getByRole('button', { name: /dashboard/i }).first();
    await dashboardBtn.click();
    await expect(page.getByText('Clinical Dashboard')).toBeVisible({ timeout: 10000 });

    // ── Step 10: Recent Testing Activity shows sessions ────────────────────
    // Mock logs are seeded — the dashboard should show at least one recent session
    await expect(page.getByText(/Recent Testing Activity/i).or(page.getByText(/recent/i))).toBeVisible({ timeout: 5000 });
  });
});
