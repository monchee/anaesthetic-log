# Plan: Project cleanup & optimization pass (v0.65.0)

## Context

Whole-project hygiene/optimization sweep after a run of feature work. Three audits
(bundle, dead-code, code-health) surfaced findings; user selected **3 tiers**
(repo hygiene + dead code, code-health quick wins, bundle/perf). **CSP enforcement
is explicitly out of scope** this pass.

Two audit claims were corrected by verification: **`next-themes` is NOT dead** (used
by `components/ui/sonner.tsx`) — keep it. The `react-hooks/exhaustive-deps` disables
in `TestingPlanGenerator.tsx` are **intentional** (recompute only on `patient.id`,
avoiding form reset) — **leave them**, optionally add a clarifying comment.

**Non-goal (deliberately excluded):** deferring `drugMasterlist` out of the main
chunk. `DRUG_CATEGORIES`/`FLAT_DRUG_OPTIONS` are computed at module load in the
widely-imported `constants.ts` via a *static* import, so the masterlist ships eagerly
regardless of when the function runs. True deferral needs an async refactor of every
synchronous consumer (form-reset risk) for ~11 KB gzip — not worth it.

---

## Tier 1 — Repo hygiene + dead code (zero runtime risk)

1. **Untrack committed test artifacts** (currently tracked, regenerated each run):
   `git rm --cached` → `playwright-report/index.html`, `test-results/.last-run.json`,
   `test-results.json`, `test-results-final.json`, `test-results-fixed.json`,
   `test-results-refined.json`, `test-results-scoped.json`.
2. **`.gitignore`**: remove the stray `-e ` line (line 30); add `test-results/`,
   `test-results*.json`, `playwright-report/`.
3. **Delete stray backup** `components/ui/index.tsx.backup` (`git rm`).
4. **Remove unused `react-hot-toast`**: delete the `LegacyToaster` export + its
   import in `components/ui/index.tsx` (lines ~90–131, the only references), then
   drop `react-hot-toast` from `package.json` dependencies. (Keep `sonner` — the
   live toast lib; keep `next-themes` — used by `sonner.tsx`.)
5. **Trim unused Radix deps** (optional, low risk): for each `@radix-ui/*` in
   `package.json`, confirm an import exists under `components/ui/`; remove any with
   zero imports AND drop them from the `radix-vendor` `manualChunks` list in
   `vite.config.ts`. Verify with grep before removing each.

---

## Tier 2 — Code-health quick wins (safe, clinical clarity)

1. **Centralize skin-test positivity threshold.** Add
   `export const SKIN_TEST_POSITIVE_THRESHOLD = 3;` to
   `src/shared/utils/constants.ts`. Replace the scattered `>= 3` checks (keep the
   existing NaN-safe `(parseInt(...) || 0)` pattern, just swap the literal):
   `testingUtils.ts:6`, `useDashboardAnalytics.ts:147,150,151,152`,
   `DrugTestGrid.tsx:28`, `TestingService.ts:70`. Pure refactor — behaviour identical.
2. **Fix tryptase non-null assertions** (`TestingLogForm.tsx:569,615,633`). Replace
   `prev.tryptase!` / `formData.tryptase!` with a guaranteed default, e.g. a local
   `const EMPTY_TRYPTASE = { obtained: false, significantElevation: false, values: [] }`
   and `(prev.tryptase ?? EMPTY_TRYPTASE)`. Prevents a crash if `tryptase` is undefined.
3. **Declare `__APP_VERSION__`.** Add `declare const __APP_VERSION__: string;` to the
   project's vite env d.ts (e.g. `src/vite-env.d.ts`); remove the `@ts-expect-error`
   at `src/core/components/Footer.tsx:6`.
4. **Guard stored-tryptase `JSON.parse`** in `src/features/testing/hooks/useTestingState.ts`
   (~line 90/135): wrap parse + `values.map` in try/catch and validate
   `Array.isArray(parsed?.tryptase?.values)` before mapping; on failure log + fall
   back to empty/undefined tryptase (don't crash restore).
5. **Log localStorage quota errors** in `src/shared/utils/ttlStorage.ts` setter:
   in the existing catch, branch on `e?.name === 'QuotaExceededError'` with a
   `console.warn`; keep the silent-fail behaviour otherwise.

---

## Tier 3 — Bundle/perf optimization

1. **Fix the empty `react-vendor` chunk.** `vite.config.ts:161`
   `'react-vendor': ['react','react-dom']` emits a 51-byte phantom chunk + a build
   warning because React is pulled into other chunks first. Replace the object-form
   `manualChunks` entry with a function form that groups `node_modules/react`,
   `react-dom`, and the JSX runtime into one real `react-vendor` chunk — OR, if a
   clean grouping isn't reliable, simply remove the `react-vendor` entry so React
   lands in the vendor chunk without the phantom. Confirm no empty-chunk warning after.
2. **Lazy-load Sentry** (removes ~15 KB gzip from the main chunk for the no-DSN case
   and defers it otherwise). `src/lib/sentry.ts` currently does a *static*
   `import * as Sentry` + `Sentry.init()` at module load. Change to an async
   `initSentry()` that `await import('@sentry/react')` then inits (only when
   `VITE_SENTRY_DSN` set and env ≠ test); call it once after first paint (e.g. in
   `main.tsx`/`App` mount effect or `requestIdleCallback`). Route captures
   (`src/lib/analytics.ts`, `ErrorBoundary`) through a tiny helper that
   dynamically imports `@sentry/react` on demand so error reporting still works.
   ⚠️ Test carefully: DSN-set build still reports errors; ErrorBoundary still
   captures; no console errors when DSN unset.

---

## Verification

- `npx tsc --noEmit` clean; `npm run lint` clean; `npm run test:unit` → **182 stay
  green** (these are refactors/behaviour-preserving; update any test that asserted
  an old literal if needed).
- `npm run build`: confirm **no "Generated an empty chunk: react-vendor" warning**,
  no chunk-size regression, and (Tier 3) main `index` chunk gzip drops (Sentry +
  react-hot-toast out). Record before/after main-chunk gzip in the commit msg.
- `git status` after Tier 1: the test-result/report files are untracked & ignored;
  `git ls-files | grep -E 'test-results|playwright-report|\.backup'` returns nothing.
- Manual (`/browse` on dev + preview): app boots, PIN unlock, dashboard, testing
  builder + print, toasts still fire (sonner), theme toggle works (next-themes via
  sonner), no console errors. If Sentry DSN is configured in the env, trigger a
  handled error and confirm it still reports.
- Version bump (0.65.0) + CHANGELOG entry summarizing hygiene/health/perf.
