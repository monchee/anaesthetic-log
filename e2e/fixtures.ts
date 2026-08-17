/**
 * e2e/fixtures.ts
 *
 * Extends Playwright's base `test` with a `page` fixture that:
 * 1. Seeds `sessionStorage['dream:unlocked'] = 'true'` so the PIN gate is
 *    bypassed on every navigation (storageState does NOT persist sessionStorage,
 *    so addInitScript is the correct mechanism).
 * 2. Seeds `localStorage['disclaimerDismissed'] = 'true'` so the demo-data
 *    banner doesn't overlap content during accessibility scans.
 * 3. Seeds `localStorage['dream:last_seen_version']` with the current version
 *    and `localStorage['dream:get_started_seen'] = '1'` so the GetStartedModal
 *    auto-open is suppressed during standard test runs.
 *
 * All three spec files import `{ test, expect }` from here instead of
 * `@playwright/test`.
 */

import { test as base, expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const _dirname = dirname(fileURLToPath(import.meta.url));
const changelogData = JSON.parse(readFileSync(resolve(_dirname, '../src/shared/data/changelog.json'), 'utf-8')) as Array<{ version: string }>;
const CURRENT_VERSION = changelogData[0].version;

export { expect };

/** Dismiss the Get Started launcher modal if present. */
export async function dismissGetStartedModal(page: Page) {
  const dialog = page.getByRole('dialog');
  const dismissButton = dialog.getByRole('button', { name: /close|skip for now|got it/i });

  if (await dismissButton.first().isVisible().catch(() => false)) {
    await dismissButton.first().click();
    await expect(dialog).toBeHidden({ timeout: 5_000 });
  }
}

/** Legacy alias for dismissGetStartedModal */
export const dismissHelpModal = dismissGetStartedModal;

export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.addInitScript((version) => {
      try {
        sessionStorage.setItem('dream:unlocked', 'true');
      } catch {
        // Safari private mode — ignore
      }
      try {
        localStorage.setItem('disclaimerDismissed', 'true');
        // Suppress the GetStartedModal auto-open by marking version and launcher as seen
        localStorage.setItem('dream:last_seen_version', version);
        localStorage.setItem('dream:get_started_seen', '1');
      } catch {
        // ignore
      }
    }, CURRENT_VERSION);

    // After every navigation, dismiss the GetStartedModal if it auto-opens.
    page.on('load', async () => {
      try {
        const closeBtn = page.locator('[role="dialog"] button', { hasText: /close|skip for now/i });
        const visible = await closeBtn.isVisible().catch(() => false);
        if (visible) {
          await closeBtn.click().catch(() => {});
        }
      } catch {
        // ignore — dialog may not be present
      }
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture API, not a React hook
    await use(page);
  },
});
