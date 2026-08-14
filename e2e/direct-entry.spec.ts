import { type Page } from '@playwright/test';
import { dismissHelpModal, expect, test } from './fixtures';

const CSV_FIXTURE = 'e2e/fixtures/redcap-sample.csv';

async function openHome(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await dismissHelpModal(page);
}

test.describe('Home quick-start entry points', () => {
  test('shows upload and direct Allergy Testing actions on Home', async ({ page }) => {
    await openHome(page);

    await expect(page.getByRole('button', { name: 'Upload REDCap export & review records', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Allergy Testing', exact: true })).toBeVisible();
  });

  test('opens direct Allergy Testing with editable identity and required-field validation', async ({ page }) => {
    await openHome(page);

    await page.getByRole('button', { name: 'Open Allergy Testing', exact: true }).click();
    await expect(page).toHaveURL(/\/testing$/);
    await expect(page.getByRole('heading', { name: 'Allergy Testing', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patient Identity', exact: true })).toBeVisible();
    await expect(page.getByLabel('MRN', { exact: true })).toBeEditable();
    await expect(page.getByLabel('First Name', { exact: true })).toBeEditable();
    await expect(page.getByLabel('Last Name', { exact: true })).toBeEditable();
    await expect(page.getByLabel('Date of Birth (Optional)', { exact: true })).toBeEditable();
    await expect(page.getByLabel('Patient identity', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Save Clinical Record', exact: true }).click();
    await expect(page.getByRole('link', { name: 'MRN is required', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'First name is required', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Last name is required', exact: true })).toBeVisible();
  });

  test('supports the /testing deep link as a direct session', async ({ page }) => {
    await page.goto('/testing');
    await page.waitForLoadState('networkidle');
    await dismissHelpModal(page);

    await expect(page).toHaveURL(/\/testing$/);
    await expect(page.getByRole('heading', { name: 'Allergy Testing', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Patient Identity', exact: true })).toBeVisible();
    await expect(page.getByLabel('MRN', { exact: true })).toBeEditable();
    await expect(page.getByLabel('Patient identity', { exact: true })).toHaveCount(0);
  });

  test('routes a successful Home REDCap upload to Dashboard', async ({ page }) => {
    await openHome(page);

    await page.getByRole('button', { name: 'Upload REDCap export & review records', exact: true }).click();
    const uploadSheet = page.getByRole('dialog', { name: 'Update Database' });
    await expect(uploadSheet).toBeVisible();
    await uploadSheet.locator('input[type="file"]').setInputFiles(CSV_FIXTURE);

    await expect(page).toHaveURL(/\/dashboard$/);
    const patientTable = page.getByRole('table', { name: 'Patient database' });
    await expect(patientTable.getByRole('button', { name: 'View details for patient: Avery Testpatient' })).toBeVisible({ timeout: 10_000 });
    await expect(patientTable.getByRole('button', { name: 'View details for patient: Jordan Samplepatient' })).toBeVisible();
  });
});
