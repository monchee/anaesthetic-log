import { type Page } from '@playwright/test';
import { dismissHelpModal, expect, test } from './fixtures';

const CSV_FIXTURE = 'e2e/fixtures/redcap-sample.csv';
const PATIENT_DATA_KEYS = [
  'anaesthetic_patients',
  'dream:active_report',
  'dream:testing_draft',
  'dream:testing_plan_builder_drafts',
  'dream:patient_db',
];

async function openFreshApp(page: Page, path = '/') {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await dismissHelpModal(page);
  await page.evaluate((keys) => keys.forEach(key => localStorage.removeItem(key)), PATIENT_DATA_KEYS);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await dismissHelpModal(page);
}

async function uploadPatientDatabase(page: Page) {
  await page.getByRole('main').getByRole('button', { name: 'Upload CSV', exact: true }).click();
  const uploadSheet = page.getByRole('dialog', { name: 'Update Database' });
  await expect(uploadSheet).toBeVisible();
  await uploadSheet.locator('input[type="file"]').setInputFiles(CSV_FIXTURE);
}

async function expectSyntheticPatients(page: Page) {
  const patientTable = page.getByRole('table', { name: 'Patient database' });
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Avery Testpatient' })).toBeVisible({ timeout: 10_000 });
  await expect(patientTable.getByRole('button', { name: 'View details for patient: Jordan Samplepatient' })).toBeVisible();
  await expect(patientTable.getByRole('button', { name: /View details for patient:/ })).toHaveCount(2);
}

async function selectMockPatient(page: Page, search: string, optionName: RegExp) {
  await page.getByRole('button', { name: /Select Patient from Database/i }).click();
  const patientSearch = page.getByRole('textbox', { name: /Filter patients by ID or name/i });
  await expect(patientSearch).toBeVisible({ timeout: 5_000 });
  await patientSearch.fill(search);
  const option = page.getByRole('option').filter({ hasText: optionName }).first();
  await expect(option).toBeVisible({ timeout: 5_000 });
  await option.click();
}

test.describe('Phase 2 dashboard workflows', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshApp(page, '/dashboard');
  });

  test('filters an uploaded worklist by needs-action and reported status', async ({ page }) => {
    await uploadPatientDatabase(page);
    await expectSyntheticPatients(page);

    const filters = page.getByRole('group', { name: 'Worklist filters' });
    await expect(filters.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await filters.getByRole('button', { name: 'Needs action', exact: true }).click();
    await expect(filters.getByRole('button', { name: 'Needs action', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expectSyntheticPatients(page);

    await filters.getByRole('button', { name: 'Reported', exact: true }).click();
    await expect(filters.getByRole('button', { name: 'Reported', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('table', { name: 'Patient database' }).getByRole('button', { name: /View details for patient:/ })).toHaveCount(0);
    await expect(page.getByRole('table', { name: 'Patient database' }).getByRole('cell', { name: 'No patients match this filter.' })).toBeVisible();
  });

  test('replaces the database after confirming a duplicate upload', async ({ page }) => {
    await uploadPatientDatabase(page);
    await expectSyntheticPatients(page);
    await expect(page.getByText('Database updated', { exact: true })).toBeHidden({ timeout: 10_000 });

    await uploadPatientDatabase(page);
    const confirmDialog = page.getByRole('dialog', { name: 'Replace existing database?' });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText('Replace existing database (2 records) with this export (2 records)?');

    await confirmDialog.getByRole('button', { name: 'Replace database' }).click();
    await expect(confirmDialog).toBeHidden();
    await expectSyntheticPatients(page);
    await expect(page.getByText('Database updated', { exact: true })).toBeVisible();
    await expect(page.getByText('Imported 2 record(s).', { exact: true })).toBeVisible();
  });

  test('keeps the original database when duplicate replacement is cancelled', async ({ page }) => {
    await uploadPatientDatabase(page);
    await expectSyntheticPatients(page);
    await expect(page.getByText('Database updated', { exact: true })).toBeHidden({ timeout: 10_000 });

    await uploadPatientDatabase(page);
    const confirmDialog = page.getByRole('dialog', { name: 'Replace existing database?' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(confirmDialog).toBeHidden();
    const uploadSheet = page.getByRole('dialog', { name: 'Update Database' });
    await uploadSheet.getByRole('button', { name: 'Close' }).click();
    await expect(uploadSheet).toBeHidden();
    await expectSyntheticPatients(page);
    await expect(page.getByText('Database updated', { exact: true })).toHaveCount(0);
  });
});

test.describe('Phase 3 clinical workflows', () => {
  test.beforeEach(async ({ page }) => {
    await openFreshApp(page);
  });

  test('carries referral tryptase values into the Powerchart letter', async ({ page }) => {
    await selectMockPatient(page, 'Fatima', /Al-Sayed, Fatima|Fatima Al-Sayed/i);
    await page.getByRole('button', { name: /Start Testing Session/i }).click();
    await expect(page.getByRole('button', { name: /Save Clinical Record/i })).toBeVisible({ timeout: 10_000 });

    const tryptaseSection = page.getByText('Serial Serum Tryptase').locator('..').locator('..');
    await expect(tryptaseSection.getByText('Imported from referral — verify')).toBeVisible();
    await expect(page.getByPlaceholder('Time (e.g. 15:30)').nth(0)).toHaveValue('12:45');
    await expect(page.getByPlaceholder('Result').nth(0)).toHaveValue('212 ng/mL');
    await expect(page.getByPlaceholder('Time (e.g. 15:30)').nth(1)).toHaveValue('14:30');
    await expect(page.getByPlaceholder('Result').nth(1)).toHaveValue('185 ng/mL');
    await expect(page.getByPlaceholder('Time (e.g. 15:30)').nth(2)).toHaveValue('08:00');
    await expect(page.getByPlaceholder('Result').nth(2)).toHaveValue('8 ng/mL');

    await page.getByRole('button', { name: /Save Clinical Record/i }).click();
    await expect(page.getByRole('tab', { name: 'Powerchart Letter' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('tab', { name: 'Powerchart Letter' }).click();

    const letter = page.getByRole('tabpanel', { name: 'Powerchart Letter' });
    await expect(letter).toContainText('212 ng/mL');
    await expect(letter).toContainText('185 ng/mL');
    await expect(letter).toContainText('8 ng/mL');
    await expect(letter).not.toContainText('not obtained');
  });

  test('auto-selects a newly marked suspected agent in the testing plan builder', async ({ page }) => {
    await selectMockPatient(page, 'Wei', /Chen, Wei|Wei Chen/i);

    const timelineDrug = page.getByRole('button', { name: /Mark Fentanyl as suspected culprit agent/i });
    await expect(timelineDrug).toBeVisible({ timeout: 5_000 });
    await expect(timelineDrug).toHaveAttribute('aria-pressed', 'false');
    await timelineDrug.click();
    await expect(page.getByRole('button', { name: /Unmark Fentanyl as suspected culprit agent/i })).toHaveAttribute('aria-pressed', 'true');

    const drugFilter = page.getByPlaceholder('Filter drugs...');
    await drugFilter.fill('Fentanyl');
    const planDrug = page.getByRole('button', { name: /Fentanyl/ }).filter({ has: page.getByLabel('Given at time of reaction') });
    await expect(planDrug).toBeVisible();
    await expect(planDrug).toHaveAttribute('aria-pressed', 'true');
    await expect(planDrug.getByLabel('Given at time of reaction')).toBeVisible();
  });
});

test.describe('Phase 2 TTL warning', () => {
  test('warns near expiry and resets the timer when work continues', async ({ page }) => {
    const now = new Date('2026-07-14T10:00:00+10:00');
    await page.clock.install({ time: now });
    await page.addInitScript(() => {
      const savedAt = Date.now() - ((5 * 60 + 31) * 60 * 1000);
      localStorage.setItem('dream:testing_plan_builder_drafts', JSON.stringify({ value: {}, savedAt }));
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await dismissHelpModal(page);

    const warning = page.getByRole('alert').filter({ hasText: 'Local clinical data expires at' });
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('Local clinical data expires at 10:29');
    await warning.getByRole('button', { name: /Keep working/ }).click();
    await expect(warning).toBeHidden();

    const refreshedSavedAt = await page.evaluate(() => {
      const entry = JSON.parse(localStorage.getItem('dream:testing_plan_builder_drafts') ?? '{}');
      return entry.savedAt;
    });
    expect(refreshedSavedAt).toBeGreaterThanOrEqual(now.getTime());
    expect(refreshedSavedAt).toBeLessThan(now.getTime() + 5_000);
  });
});
