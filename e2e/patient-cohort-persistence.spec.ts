import { test, expect } from './fixtures';

test('uploaded patient cohort persists across a browser refresh', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const quickStartDialog = page.getByRole('dialog');
  if (await quickStartDialog.isVisible().catch(() => false)) {
    await quickStartDialog.getByRole('button', { name: /skip for now|got it/i }).click();
  }

  await page.getByRole('button', { name: 'Upload CSV', exact: true }).click();
  const uploadSheet = page.getByRole('dialog', { name: 'Update Database' });
  await expect(uploadSheet).toBeVisible();
  await uploadSheet.locator('input[type="file"]').setInputFiles('e2e/fixtures/redcap-sample.csv');

  const patientTable = page.getByRole('table', { name: 'Patient database' });
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Avery Testpatient' })).toBeVisible({ timeout: 10_000 });
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Jordan Samplepatient' })).toBeVisible();
  await expect(page.getByText(/Imported database · 2 patients · expires \d{2}:\d{2}/)).toBeVisible();

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(patientTable.getByRole('button', { name: 'View details for patient: Avery Testpatient' })).toBeVisible({ timeout: 10_000 });
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Jordan Samplepatient' })).toBeVisible();
  await expect(page.getByText(/Imported database · 2 patients · expires \d{2}:\d{2}/)).toBeVisible();
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Wei Chen' })).toHaveCount(0);
});
