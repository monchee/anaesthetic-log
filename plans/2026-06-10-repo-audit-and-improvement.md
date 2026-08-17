# DREAM App — Repo Audit & Improvement Plan

_Audited: 2026-06-10 | Version: v0.65.0 | Auditor: Claude Sonnet 4.6_

---

## Executive Summary

**Overall Health Grade: B+**

DREAM is a mature, thoughtfully-built clinical PWA with an excellent privacy model, modern stack, and active development. The architecture is intentional and the threat model (PHI protection, local-first storage) is well-executed. The app is in good shape for its scope — a specialist internal clinical tool, not a public SaaS.

**Top 3 Risks:**
1. `useTestingState.handleSubmit` — the single most critical code path in the app (saves clinical records) — has 4.22% test coverage. A regression here could silently corrupt or lose patient data.
2. `App.tsx` (572 lines) acts as the app's router, layout manager, and orchestrator simultaneously. All navigation logic is inline with no library; adding screens or refactoring flows requires editing this file.
3. `TestingLogForm.tsx` (769 lines) is a monolithic form component with 37% test coverage — the primary clinical data-entry surface.

**Top 3 Opportunities:**
1. Add focused unit tests for `useTestingState` and `TestingService` — high confidence, low risk, immediate safety net.
2. Extract screen-level components from `App.tsx` into their own files — makes the routing intent readable and the screens independently testable.
3. Fix a dormant draft-restore bug: `window.location.pathname === '/testing'` will never match in this SPA (the path is always `/`), meaning in-progress draft restoration silently never fires.

---

## Repo Map

**Project:** DREAM (Drug Reaction Evaluation & Anaesthetic Management)  
**Purpose:** Private clinical PWA for RPAH Department of Clinical Immunology & Allergy. Clinicians use it to manage anaesthetic allergy testing sessions — patient lookup, protocol-driven SPT/IDT test plans, result logging, report generation, and optional de-identified research submissions.  
**Intended Users:** Immunology/allergy nurses and physicians at a single hospital department.  
**Maturity:** Production, actively maintained. v0.65.0 with semantic versioning, CHANGELOG, CI/CD, and E2E tests.

**Stack:**
- React 19.2.3 + TypeScript 5.9.3 (SPA)
- Vite 6.2.0 (build), Tailwind CSS 3.4.19 + shadcn/ui (UI)
- Vitest 4.1.0 (unit), Playwright 1.58.2 (E2E, 3 browsers)
- Supabase (optional research backend), Sentry (optional error tracking)
- Cloudflare Pages (deploy), GitHub Actions (CI)
- PWA via vite-plugin-pwa + Workbox

**Architecture:**
- **Local-first SPA.** All PHI stays in the browser; only de-identified research data touches the network (Supabase).
- **Screen-based routing.** A `Screen` enum drives `App.tsx` conditional rendering — no react-router. All top-level navigation logic lives inline in `App.tsx`.
- **State:** Three composed hooks (`usePatientState`, `useTestingState`, `useAppNavigation`) combined in `useAnaestheticApp`. No external state library.
- **Storage:** `localStorage` with 6-hour TTL (via `ttlStorage.ts`). Draft autosave (500ms debounce). Data self-expires to protect shared workstations.
- **Feature modules:** `src/features/{dashboard,patients,testing,reports,research,info-pages}` — clean separation.

**Key Directories:**

| Path | Description |
|---|---|
| `App.tsx` | God-component: main UI shell, routing, all screen renderers |
| `src/core/` | App shell, providers, layout, navigation hook |
| `src/features/` | 6 feature modules (dashboard, patients, testing, reports, research, info-pages) |
| `src/shared/` | Cross-cutting types, hooks, utils, drug masterlist, mock data |
| `src/lib/` | External integrations (Sentry, Supabase, analytics, env validation) |
| `components/ui/` | shadcn/ui primitives (30+) |
| `e2e/` | Playwright specs (smoke, testing-day, a11y, ui-ux-remediation) |
| `scripts/` | `generate-changelog.mjs` — syncs CHANGELOG.md → changelog.json pre-build |
| `supabase/migrations/` | DB schema migrations |

**Surprises:**
- `window.location.pathname === '/testing'` in `useTestingState.ts:83` — this SPA always serves from `/`, so this condition is permanently false. Draft restore for in-progress sessions is effectively dead code.
- `handleSubmit` in `useTestingState.ts:111` does a full `JSON.stringify → JSON.parse → manual field-by-field string-coercion`. This is a creative defense against prototype pollution / unexpected types from localStorage, but adds ~50 lines of boilerplate with no tests.
- Mock data (`mockPatients.ts`, 1352 lines) is a dynamic import — correctly lazy-loaded, not in the main bundle.
- `next-themes` package is used in a Vite app (not Next.js) — works fine, just inherited from shadcn install docs.
- Two separate `lib/utils.ts` files exist: `lib/utils.ts` (root) and `src/lib/` directory — the root one is the shadcn `cn()` helper; the `src/lib/` directory holds real integrations. Potential confusion.

---

## Audit Report

### Architecture & Design

**Finding A1 — App.tsx is a routing god-component** _(High)_
- `App.tsx` (572 lines) contains: all screen-level UI rendering (20+ screens via `if screen === X` chains), copy-to-clipboard handlers, modal state, research submission wiring, tab state for reports, and the `handleProceedToTesting` flow.
- **Why it matters:** Every new screen or flow change touches this file. It's the single most merge-conflict-prone file. It's untestable as a unit — you can't render individual screens in isolation.
- **Fact:** 20+ imported components and 5 local state variables defined in `AnaestheticLogApp`.

**Finding A2 — Draft restore is permanently dead code** _(High — correctness bug)_
- `useTestingState.ts:83`: `if (window.location.pathname === '/testing')` — in a Vite SPA deployed at `/`, `pathname` is always `/`. The condition never matches.
- **Consequence:** In-progress testing drafts are written to localStorage (the autosave works) but never restored after a page reload. Clinicians who accidentally close the tab mid-session lose their in-progress data silently.
- **Fact:** Verified by reading the code. `TESTING_DRAFT_KEY` writes succeed but restore never fires.

**Finding A3 — No dependency injection / testability for localStorage** _(Medium)_
- `useTestingState` calls `setWithTTL`, `getIfFresh`, `removeStored` directly — no seam for testing without mocking localStorage. Explains the 4.22% coverage: the hook is hard to test.

**Finding A4 — Research submission always initialized** _(Low)_
- `useResearchSubmit()` is called at the `AnaestheticLogApp` root in `App.tsx:91`. This hook runs even when the research feature is disabled or the patient hasn't completed testing. Minor overhead, no functional issue.

---

### Code Quality

**Finding Q1 — `useTestingState.handleSubmit` JSON round-trip pattern** _(Medium)_
- `useTestingState.ts:112-176`: Data is serialized to JSON and immediately re-parsed, then every single field is manually re-coerced to its correct type (65 lines). This is a defensive guard against corrupted localStorage data but:
  - Creates a massive maintenance surface (add a new field → must add a new coercion line here)
  - Has 4.22% test coverage — the very sanitization logic it's meant to provide is unverified
  - **Alternative:** A Zod schema parse on read would be more maintainable, explicit about what's trusted, and testable.

**Finding Q2 — 197 TypeScript `any` usages** _(Medium — judgment)_
- Most are in test files (acceptable) or event handler patterns.
- Notable typed gaps in production code:
  - `PatientTable.tsx`: `updateFilter: (key: keyof SearchFilters, value: any) => void`
  - `ChallengeSection.tsx`: `onChange: (field: string, value: any) => void`
  - `useAnaestheticApp.ts:36`: `originalHandleManualDetailChange(field as any, value)` — a type cast hiding a string→field key mismatch
- **No `@ts-ignore` found** — good discipline.

**Finding Q3 — TestingLogForm.tsx is 769 lines** _(Medium)_
- The primary clinical form handles: control results, drug test rows, challenge section, nurse notes, tryptase section. Each section is a logical unit that could be an extracted component.
- 37.11% test coverage on this file.

**Finding Q4 — Silent `.catch()` suppresses mock data load errors** _(Low)_
- `useTestingState.ts:106`: `}).catch(() => { /* silent fallback */ })` — if `mockTestingLogs` fails to load, the dashboard silently shows empty state with no logging. Should at minimum `console.warn`.

**Finding Q5 — Inline string constant for CSS class** _(Low)_
- `App.tsx:35-36`: `BACK_BTN` and `BACK_ICON` are module-level string constants for Tailwind classes. These belong in a `cn()` utility function or a dedicated component, not a constant string.

---

### Security

**Finding S1 — `.env.local` is properly gitignored** _(No issue — verified)_
- `.gitignore:13` has `*.local` pattern; `.gitignore:16` has explicit `.env.local` entry. The file is not tracked. Supabase anon key is safe.
- The Supabase `anon` key is intentionally public (client-side RLS key) — its exposure in the browser is expected and correct.

**Finding S2 — PHI protection model is strong** _(Strength)_
- Sentry scrubs PHI fields before transmission (`sentry.ts:33-50`).
- All clinical data stays local; only de-identified research payloads go to Supabase (`ResearchService.deidentify()`).
- 6-hour TTL on localStorage keys prevents data lingering on shared workstations.
- Redact toggle for shoulder-surfing control.

**Finding S3 — Password gate is UI-only, not cryptographic** _(Low — acknowledged risk)_
- `PasswordGate.tsx` prevents casual shoulder-surfing but is not a security boundary. For a private clinical app on trusted hardware, this is appropriate. Documented in SECURITY.md.

**Finding S4 — npm audit: 0 vulnerabilities** _(Strength)_
- All dependencies are current. `serialize-javascript@7.0.5` is pinned to prevent a known security regression. Good hygiene.

---

### Testing

**Finding T1 — `useTestingState` has 4.22% coverage** _(High)_
- This hook contains: draft restore logic, debounced autosave, `handleSubmit` (the primary data-save path), `resetForm`, `clearActiveReport`. All business-critical behaviors. None are meaningfully tested.
- **Consequence:** A regression in `handleSubmit` (e.g., losing the tryptase field, corrupting IDT results) would go undetected until a clinician reports lost data.

**Finding T2 — `TestingService` has 27.9% coverage** _(High)_
- `TestingService.ts` contains `validateForm` (form validation) and `isSkinTestPositive` (threshold logic). These are core clinical decision functions. A validation edge case bug could allow invalid records to be saved.

**Finding T3 — `isTestingSessionDirty` has 0% coverage** _(Medium)_
- This function gates the autosave — if it returns `false` erroneously, drafts are never saved. Zero coverage.

**Finding T4 — Test coverage overall: 55.8% statements** _(Medium)_
- Below the 80% target for core business logic. Well-tested areas: `testingUtils.ts` (100%), `dateUtils.ts` (88%), `csvUtils.ts` (75%), `TestingPlanGenerator.tsx` (65%). Gaps concentrated in hooks.

**Finding T5 — E2E smoke tests exist but test-day spec is shallow** _(Low — judgment)_
- `e2e/testing-day.spec.ts` exists but doesn't exercise the full form-submit-report cycle with real data. More of a navigation check than a clinical workflow test.

---

### Performance

**Finding P1 — No issues found** _(Healthy)_
- Lazy loading for all heavy screens (`React.lazy`). Manual Vite chunk splitting (`radix-vendor`, `form-vendor`, `icons`, `notifications`). PWA caching for fonts and static assets. Mock data is a dynamic import. No N+1 or blocking patterns detected.

---

### Dependencies

**Finding D1 — All dependencies current, no CVEs** _(Strength)_
- React 19.2.3, TS 5.9.3, Vite 6.2.0 — all latest. `npm audit` returns 0 vulnerabilities. Lock file present. No duplicated packages.

**Finding D2 — `next-themes` in a non-Next.js app** _(Low)_
- Works correctly but signals the package was copied from shadcn docs without review. No functional issue; `next-themes` is framework-agnostic despite its name.

---

### DevEx & Operations

**Finding O1 — CI is solid** _(Strength)_
- GitHub Actions runs type-check → lint → unit tests → build on every push/PR to `main`. Blocks merges on failure.

**Finding O2 — No coverage threshold enforcement in CI** _(Medium)_
- Vitest runs with coverage but CI doesn't fail if coverage drops. A `coverageThreshold` config in `vitest.config.ts` would prevent regressions.

**Finding O3 — `deploy` script has no pre-flight** _(Low)_
- `npm run deploy` runs `build && wrangler deploy` without running tests first. A failed test suite won't block a manual deploy. The CI gate helps but a local `npm run deploy` bypasses it.

---

### Documentation

**Finding Doc1 — README, CONTRIBUTING, CHANGELOG, SECURITY.md all present and accurate** _(Strength)_
- Documentation is thorough and matches the code. The CHANGELOG is auto-synced from markdown to JSON at build time.

**Finding Doc2 — Draft restore behavior not documented** _(Low)_
- The 6-hour TTL and autosave are mentioned in code comments, but the bug (dead restore condition) and the correct expected behavior are not documented anywhere, making it easy to miss.

---

### Strengths Summary

1. Excellent PHI protection model — local-first, TTL expiry, de-identification, Sentry scrubbing
2. Modern stack (React 19, TS 5.9, Vite 6) — no tech debt from legacy choices
3. Feature-module architecture is clean and consistent
4. Comprehensive Playwright E2E suite across 3 browsers
5. CI/CD with type-check, lint, test, and build gates
6. PWA with proper caching and offline support
7. Drug masterlist and protocol-driven testing — good domain modeling
8. Zod-validated environment variables
9. Thorough documentation (README, CONTRIBUTING, CHANGELOG, SECURITY)
10. 0 npm vulnerabilities, all dependencies current

---

## Improvement Strategy

### Theme 1 — Safety Net: Critical Path Test Coverage

**Scope:** `useTestingState`, `TestingService`, `isTestingSessionDirty`  
**Target State:** ≥80% branch coverage on `handleSubmit`, `validateForm`, `isSkinTestPositive`, and `isTestingSessionDirty`.  
**Principle:** Clinical data save paths must have automated regression detection. A bug in `handleSubmit` could silently corrupt saved records.  
**What "done" looks like:** Vitest reports ≥80% branches on these three files. CI fails if they drop below threshold.

### Theme 2 — Fix the Draft Restore Bug

**Scope:** `useTestingState.ts:83`  
**Target State:** In-progress testing sessions restore correctly after a page reload.  
**Principle:** The autosave investment is wasted if the restore path is broken. This is a data-loss risk for clinicians who lose connectivity or accidentally reload mid-session.  
**What "done" looks like:** A unit test proves draft restores when data is present; a Playwright smoke test reloads mid-session and verifies form state is preserved.

### Theme 3 — Decompose App.tsx Routing

**Scope:** `App.tsx` (572 lines)  
**Target State:** `App.tsx` is a thin orchestrator (<150 lines) that delegates each screen to a named component in `src/core/screens/` or `src/features/*/screens/`.  
**Principle:** The current monolith makes every feature change require editing the same file. Extracted screen components are independently renderable and testable.  
**What "done" looks like:** `App.tsx` contains no inline JSX for any individual screen; each screen is a named import; no merge conflicts on `App.tsx` for isolated feature changes.  
**Trade-off NOT recommending:** Introducing react-router. The custom Screen enum navigation is intentional, understood by the team, and appropriate for this app's single-device, single-user usage pattern. Don't add routing complexity for its own sake.

### Theme 4 — Strengthen Type Safety in Critical Handlers

**Scope:** `useAnaestheticApp.ts:36`, `ChallengeSection.tsx`, `PatientTable.tsx`, `useTestingState.ts handleSubmit`  
**Target State:** Replace `field as any` and `value: any` in production code with proper union types or Zod schema parse.  
**Principle:** Type coercion at the save boundary (`handleSubmit`) is where precision matters most — a wrong type here silently stores bad data.  
**What NOT to fix:** `any` usage in test helpers and mocks — acceptable cost, not worth the effort.

### Theme 5 — Coverage Threshold in CI

**Scope:** `vitest.config.ts`, `.github/workflows/ci.yml`  
**Target State:** CI fails if statement coverage on `src/features/testing/` drops below 70%.  
**Principle:** Coverage without enforcement is a lagging indicator. A threshold gate makes the safety net self-maintaining.  
**Trade-off:** Start at 70% (current is ~37-55% in testing feature), not 80%, to avoid blocking PRs on unrelated coverage drops.

---

## Task Plan

### Quick Wins (High impact, S effort — do these first)

| # | Task | Effort | Risk |
|---|---|---|---|
| QW1 | Fix draft restore condition (`pathname === '/testing'` → check for stored draft existence) | S | Low |
| QW2 | Add `console.warn` to silent mock-data `.catch()` in `useTestingState.ts:106` | S | None |
| QW3 | Add `coverageThreshold` to `vitest.config.ts` (start at current level to prevent regression) | S | None |

---

### Milestone 0 — Safety Net (before any refactoring)

**Goal:** Tests around the critical paths so refactoring doesn't break them silently.

#### Task M0-1: Unit tests for `useTestingState`
**Description:** Write tests covering: initial state, draft restore from localStorage, autosave debounce behavior, `handleSubmit` happy path (verifies all fields serialize/sanitize correctly), `handleSubmit` with tryptase and nurse notes, `resetForm`, `clearActiveReport`. Mock `ttlStorage` functions.  
**Files affected:** `src/features/testing/hooks/useTestingState.ts`, new `useTestingState.test.ts`  
**Acceptance criteria:** ≥80% branch coverage on `useTestingState.ts`; CI green  
**Effort:** M  
**Risk:** Low (tests only, no prod changes)  
**Dependencies:** None

#### Task M0-2: Unit tests for `TestingService`
**Description:** Cover `validateForm` edge cases (missing MRN, empty test panel, challenge with missing drug, UNSUCCESS with no symptoms), `isSkinTestPositive` boundary conditions (2mm → false, 3mm → true, IDT results).  
**Files affected:** `src/features/testing/services/TestingService.ts`, `TestingService.test.ts`  
**Acceptance criteria:** ≥80% branch coverage; all threshold boundary cases tested  
**Effort:** S  
**Risk:** None  
**Dependencies:** None

#### Task M0-3: Tests for `isTestingSessionDirty`
**Description:** Test all conditions that make a session "dirty" and the clean initial state.  
**Files affected:** `src/features/testing/utils/isTestingSessionDirty.ts`, new test file  
**Acceptance criteria:** 100% branch coverage (it's a pure function)  
**Effort:** S  
**Risk:** None  
**Dependencies:** None

---

### Milestone 1 — Critical Fixes (correctness & data integrity)

#### Task M1-1: Fix draft restore bug
**Description:** `useTestingState.ts:83` checks `window.location.pathname === '/testing'` which is always `/` in this SPA. Replace condition with: always attempt restore if `TESTING_DRAFT_KEY` data exists and the report summary screen hasn't been shown. Simplest fix: remove the pathname guard entirely (the TTL already prevents stale restoration; the draft is cleared on submit).  
**Files affected:** `src/features/testing/hooks/useTestingState.ts:83`  
**Acceptance criteria:** Unit test proves draft restores when localStorage contains valid draft data; Playwright test reloads mid-session and verifies form state preserved  
**Effort:** S  
**Risk:** Low — removes a guard that was never true; behavior change is intentional and additive  
**Dependencies:** M0-1 (tests first)

**Implementation sketch:**
```typescript
// Before (line 83):
if (window.location.pathname === '/testing') {
  const draft = getIfFresh<LogFormData>(TESTING_DRAFT_KEY, ACTIVE_REPORT_TTL_MS);
  if (draft) setFormData({ ...draft, tryptase: sanitizeTryptase(draft.tryptase) });
}

// After — restore whenever a fresh draft exists (TTL is the guard):
const draft = getIfFresh<LogFormData>(TESTING_DRAFT_KEY, ACTIVE_REPORT_TTL_MS);
if (draft) setFormData({ ...draft, tryptase: sanitizeTryptase(draft.tryptase) });
```
**Gotcha:** Verify the draft is cleared on `handleSubmit` (`removeStored(TESTING_DRAFT_KEY)` at line 170 — it is) and on `resetForm` (line 181 — it is). The restore-on-home-screen concern from the comment is addressed by submit/reset clearing the draft key.

#### Task M1-2: Add CI coverage threshold
**Description:** Add `coverage.thresholds` to `vitest.config.ts` targeting the `testing` feature. Set initial thresholds at current measured levels (statements: 55, branches: 46) to prevent regression, then raise after M0 tasks complete.  
**Files affected:** `vitest.config.ts`  
**Acceptance criteria:** `npm run test:coverage` fails if coverage drops below threshold; CI enforces this  
**Effort:** S  
**Risk:** None  
**Dependencies:** M0-1, M0-2, M0-3 (run coverage after adding tests to set realistic thresholds)

---

### Milestone 2 — High-Leverage Improvements

#### Task M2-1: Decompose App.tsx screens
**Description:** Extract each `screen === Screen.X` rendering block from `App.tsx` into named components. Create `src/core/screens/` directory with one file per screen group (e.g., `LogScreen.tsx`, `TestingScreen.tsx`, `SummaryScreen.tsx`, `DashboardScreen.tsx`). Each receives the props it needs from `useAnaestheticApp`. `App.tsx` becomes a thin switcher.  
**Files affected:** `App.tsx`, new `src/core/screens/*.tsx` files  
**Acceptance criteria:** `App.tsx` < 200 lines; each screen component renders correctly in isolation; no behavior change visible in Playwright E2E  
**Effort:** L  
**Risk:** Medium — large mechanical refactor; Playwright E2E suite is the regression guard  
**Dependencies:** M0-1 (safety net first)

**Implementation sketch:** 
1. Identify each `if (screen === Screen.X)` block in `App.tsx` 
2. Extract block to `src/core/screens/XScreen.tsx`, accepting destructured props
3. Replace with `<XScreen {...props} />`
4. Keep all handlers in `useAnaestheticApp` — don't move logic, only JSX
5. Run Playwright E2E after each extraction to catch regressions

#### Task M2-2: Replace `handleSubmit` JSON round-trip with Zod schema parse
**Description:** The 65-line manual field-by-field coercion in `useTestingState.handleSubmit` should be replaced with a `LogFormData` Zod schema parse. This makes the sanitization explicit, co-located with the type, and automatically tested via the schema. `zod` is already a dependency.  
**Files affected:** `src/features/testing/types.ts`, `src/features/testing/hooks/useTestingState.ts`  
**Acceptance criteria:** `handleSubmit` < 30 lines; Zod schema parse throws a typed error on invalid data; existing behavior preserved; coverage on this path ≥80%  
**Effort:** M  
**Risk:** Medium — changes the save path; requires M0-1 tests as the regression guard  
**Dependencies:** M0-1, M1-1

#### Task M2-3: Fix `value: any` in production handlers
**Description:** Replace `any` in three production-code callsites: `useAnaestheticApp.ts:36` (`field as any`), `ChallengeSection.tsx` (`onChange` signature), `PatientTable.tsx` (`updateFilter` value param). Use proper union types derived from the existing `LogFormData` and `SearchFilters` types.  
**Files affected:** `src/core/hooks/useAnaestheticApp.ts:36`, `src/features/testing/components/ChallengeSection.tsx`, `src/features/dashboard/components/PatientTable.tsx`  
**Acceptance criteria:** TypeScript strict-mode passes with no `as any` or `: any` in these three files  
**Effort:** S  
**Risk:** Low — type-only changes  
**Dependencies:** None

---

### Milestone 3 — Quality & Polish

#### Task M3-1: Extract TestingLogForm sections into sub-components
**Description:** Split `TestingLogForm.tsx` (769 lines) into: `ControlsSection.tsx`, `DrugTestPanel.tsx`, `ChallengeSection.tsx` (already partially exists), `NurseNotesSection.tsx`, `TryptaseSection.tsx`. Each receives only the props it needs.  
**Files affected:** `src/features/testing/components/TestingLogForm.tsx` + 4 new files  
**Acceptance criteria:** `TestingLogForm.tsx` < 250 lines; each sub-component is independently testable; no behavior change  
**Effort:** L  
**Risk:** Low (mechanical split, no logic moves)  
**Dependencies:** M0-1

#### Task M3-2: Improve E2E testing-day spec
**Description:** Extend `e2e/testing-day.spec.ts` to complete a full workflow: select patient → set test results → submit → verify report contains correct drug names and positive/negative results. Currently only tests navigation.  
**Files affected:** `e2e/testing-day.spec.ts`  
**Acceptance criteria:** E2E spec submits a real testing session and asserts on report content  
**Effort:** M  
**Risk:** None  
**Dependencies:** M1-1 (draft restore fix, to not interfere with test state)

#### Task M3-3: Add `console.warn` to silent catch + document TTL behavior
**Description:** `useTestingState.ts:106` silently swallows mock load failures. Add `console.warn`. Also add a short comment to `useTestingState.ts` documenting the intended draft restore behavior (now that the bug is fixed) so future developers understand the storage model.  
**Files affected:** `src/features/testing/hooks/useTestingState.ts`  
**Acceptance criteria:** Mock load failures produce a console warning; comment explains the TTL/draft/report storage model  
**Effort:** S  
**Risk:** None  
**Dependencies:** M1-1

---

### Task Summary Table

| ID | Title | Milestone | Effort | Risk | Depends On |
|---|---|---|---|---|---|
| QW1 | Fix draft restore condition | Quick Win | S | Low | — |
| QW2 | Add warn to silent catch | Quick Win | S | None | — |
| QW3 | Add vitest coverage threshold | Quick Win | S | None | — |
| M0-1 | Tests for useTestingState | 0 | M | Low | — |
| M0-2 | Tests for TestingService | 0 | S | None | — |
| M0-3 | Tests for isTestingSessionDirty | 0 | S | None | — |
| M1-1 | Fix draft restore bug | 1 | S | Low | M0-1 |
| M1-2 | CI coverage threshold | 1 | S | None | M0-1, M0-2, M0-3 |
| M2-1 | Decompose App.tsx screens | 2 | L | Medium | M0-1 |
| M2-2 | Replace handleSubmit JSON round-trip | 2 | M | Medium | M0-1, M1-1 |
| M2-3 | Fix `value: any` in handlers | 2 | S | Low | — |
| M3-1 | Extract TestingLogForm sections | 3 | L | Low | M0-1 |
| M3-2 | Full E2E workflow test | 3 | M | None | M1-1 |
| M3-3 | Warn + document TTL behavior | 3 | S | None | M1-1 |

---

## Open Questions

1. **Draft restore intent:** Should in-progress drafts restore on the home screen (LOG), or only when navigating directly to the testing screen? The current comment suggests home-screen restore is undesirable ("risk injecting one patient's results into another"). Removing the pathname guard (QW1/M1-1) restores on every load — is that acceptable, or should the draft only restore if the selected patient matches the draft's MRN?

2. **Zod on save vs. Zod on load:** Task M2-2 proposes Zod parse in `handleSubmit`. An alternative is to parse only on `getIfFresh` (the read path from localStorage). Which boundary is the right place to validate — on save, on restore, or both?

3. **App.tsx screen extraction scope:** Should extracted screen components live in `src/core/screens/` (routing concern) or in their respective feature folders (e.g., `src/features/testing/screens/TestingScreen.tsx`)? The feature-folder approach is more consistent with the existing architecture.

4. **Coverage target:** The plan proposes 70% branch coverage for `src/features/testing/` as the CI gate. Is 70% the right starting point, or would 60% (closer to current) be less disruptive to the merge flow while teams add tests?

5. **`next-themes` replacement:** Worth swapping for a smaller/native theme toggle? This is purely cosmetic effort with no functional benefit — recommend leaving it unless a dependency audit specifically targets bundle size.
