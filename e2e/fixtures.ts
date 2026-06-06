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
 *    so the HelpModal "What's New" auto-open is suppressed.
 *
 * Note: The HelpModal ALSO auto-opens when `hasData === false` (demo mode).
 * We dismiss it after page load by clicking "Skip for now".
 *
 * All three spec files import `{ test, expect }` from here instead of
 * `@playwright/test`.
 */

import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const _dirname = dirname(fileURLToPath(import.meta.url));
const changelogData = JSON.parse(readFileSync(resolve(_dirname, '../src/shared/data/changelog.json'), 'utf-8')) as Array<{ version: string }>;
const CURRENT_VERSION = changelogData[0].version;

export { expect };

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
        // Suppress the HelpModal "new version" banner by marking current version as seen
        localStorage.setItem('dream:last_seen_version', version);
      } catch {
        // ignore
      }
    }, CURRENT_VERSION);

    // After every navigation, dismiss the HelpModal if it auto-opens (demo mode).
    // It renders a "Skip for now" button in the dialog footer.
    page.on('load', async () => {
      try {
        const skipBtn = page.locator('[role="dialog"] button', { hasText: /skip for now/i });
        // Wait briefly for any auto-open dialog, then dismiss if present
        const visible = await skipBtn.isVisible().catch(() => false);
        if (visible) {
          await skipBtn.click().catch(() => {});
        }
      } catch {
        // ignore — dialog may not be present
      }
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright's fixture API, not a React hook
    await use(page);
  },
});
