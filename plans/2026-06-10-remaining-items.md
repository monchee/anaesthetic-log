# DREAM — Remaining Items after Audit Cycle

_Created: 2026-06-10 | Tracks work still open after v0.66.0, v0.67.0, and the help-modal patch_

## What shipped

| Release | Items completed |
|---------|----------------|
| v0.66.0 | Critical-path tests (useTestingState, TestingService, isTestingSessionDirty), draft-restore bug fix, form-handler type safety, CI coverage gate, E2E draft-restore spec, warn on silent catch |
| v0.67.0 | App.tsx routing decomposition → `src/core/screens/`, TestingLogForm thinned to 114 lines (7 section components in TestingLogFormSections.tsx), Zod schema replacing handleSubmit JSON round-trip, gitignore `/data/` fix |
| patch | Help modal re-opening on every screen navigation (sessionStorage guard) |

All original audit Milestone 0–3 tasks are complete. Three items remain.

---

## RI-1: Hoist HelpModal out of ScreenLayout (architecture cleanup)

**Priority:** Medium · **Effort:** S · **Risk:** Low

**Problem:** The v0.67.0 routing decomposition put `ScreenLayout` inside each screen component, which means `HelpModal` is instantiated once per screen. The sessionStorage guard (`dream:help_shown_session`) prevents re-opening mid-session, but the underlying architecture still creates multiple `HelpModal` instances across the app's lifetime and couples the auto-open logic to component mount/unmount cycles.

**Target state:** `HelpModal` is rendered exactly once at the `AnaestheticLogApp` level in `App.tsx`. `ScreenLayout` renders only the nav-menu trigger button (which already has `hideTrigger` support). The sessionStorage band-aid can be removed once hoisted.

**Files:**
- `App.tsx` — add `<HelpModal>` alongside `renderScreenContent()`
- `src/core/components/ScreenLayout.tsx` — remove `<HelpModal>` render; keep the `data-help-modal-trigger` button click (it's a DOM query that finds the single app-level instance)
- `src/core/components/HelpModal.tsx` — remove `SESSION_SHOWN_KEY` / sessionStorage guard (no longer needed)

**Acceptance:** One `HelpModal` in the React tree regardless of screen; modal behaviour unchanged (new version or no CSV → show once per session); sessionStorage key removed.

**Risk note:** The existing `data-help-modal-trigger` DOM query in `ScreenLayout` finds the trigger button by attribute — it'll continue to work because the single hoisted instance still renders that hidden button. No change needed there.

---

## RI-2: Ratchet the vitest coverage threshold

**Priority:** Low · **Effort:** S · **Risk:** None

**Problem:** The threshold in `vitest.config.ts` was set at the measured level when it was introduced (~63% statements) to avoid blocking PRs. Now that the structural refactors are stable the floor should be raised to reflect the improved state and prevent future regression.

**Current thresholds** (`src/features/testing/**`):
```
statements: 63, branches: 64, functions: 49, lines: 63
```

**Target:** Run `npm run test:coverage`, check actual numbers, raise each threshold to `actual - 2` (leaves headroom for trivial one-liners that don't need tests, prevents silent backslide).

**Files:** `vitest.config.ts`

**Acceptance:** `npm run test:coverage` still exits 0; thresholds are higher than today's values; CI green.

---

## RI-3: Split `TestingLogFormSections.tsx` into individual files (optional, polish)

**Priority:** Low · **Effort:** M · **Risk:** Low

**Context:** OI-3 thinned `TestingLogForm.tsx` to 114 lines and moved 7 named section components into `TestingLogFormSections.tsx` (766 lines). The acceptance criteria are met — sections are named exports, independently renderable, Playwright E2E green. This item is purely about discoverability and future testability.

**Target state:** Each section is its own file:
- `ControlsSection.tsx` (visit details + skin-test controls)
- `DrugTestPanelSection.tsx`
- `DrugChallengeSection.tsx`
- `TryptaseSection.tsx`
- `AssessmentPlanSection.tsx`
- `NurseNotesSection.tsx`
- `SaveActionSection.tsx`

`TestingLogFormSections.tsx` becomes a barrel re-export or is deleted.

**Files:** `src/features/testing/components/` — 7 new files + update `TestingLogForm.tsx` imports.

**Acceptance:** No behavior change; Playwright E2E green; each section file < 200 lines; `TestingLogFormSections.tsx` removed or is a pure re-export barrel.

**Note:** Do this only if you want each section unit-testable in isolation. If the current single-file structure is readable enough, skip it — the goal of making `TestingLogForm.tsx` thin is already achieved.

---

## Status table

| ID | Item | Effort | Risk | Status |
|----|------|--------|------|--------|
| RI-1 | Hoist HelpModal to app root | S | Low | Outstanding |
| RI-2 | Ratchet vitest coverage threshold | S | None | Outstanding |
| RI-3 | Split TestingLogFormSections into files | M | Low | Optional |

**Suggested order:** RI-1 → RI-2 → RI-3 (if desired).
