# DREAM — Outstanding Audit Items

_Created: 2026-06-10 | Source: repo audit (`2026-06-10-repo-audit-and-improvement.md`)_

These are the items deferred from the v0.66.0 "Hardened" safety-net release. The Milestone 0/1 work (critical-path tests, draft-restore fix, type-safety, CI coverage gate) shipped in v0.66.0. What remains is the larger Milestone 2/3 refactor work plus one repo-hygiene fix discovered during release.

---

## Quick fix (do first)

### OI-0: Narrow the overly broad `data/` gitignore rule
**Priority:** Medium · **Effort:** S · **Risk:** Low

The ignore rule added in commit `324b3f5` ("guard data/ from accidental commits (PII)") is `data/`, which matches **any** `data/` directory at any depth — including `src/shared/data/`. That folder holds tracked source (`changelog.json`, `drugMasterlist.ts`, `mockPatients.ts`, etc.). During the v0.66.0 release, staging `changelog.json` required `git add -f`. Worse: any **new** file added under `src/shared/data/` would be silently ignored and never committed.

- **File:** `.gitignore:37`
- **Fix:** Change `data/` → `/data/` (anchors to repo root only), so the PII guard still covers the top-level `data/` folder without catching `src/shared/data/`.
- **Acceptance:** `git check-ignore src/shared/data/changelog.json` returns nothing; `git check-ignore data/labels_only.csv` still matches.

---

## Milestone 2 — High-Leverage Refactors

### OI-1: Decompose `App.tsx` routing god-component
**Priority:** High · **Effort:** L · **Risk:** Medium

`App.tsx` (572 lines) renders every screen inline via `screen === Screen.X` chains, alongside modal state, clipboard handlers, report tab state, and the research-submit wiring. Every feature change touches this one file; individual screens can't be rendered or tested in isolation.

- **Target:** `App.tsx` becomes a thin switcher (<200 lines). Extract each screen block into a named component.
- **Open question (from audit):** Should extracted screens live in `src/core/screens/` (routing concern) or in their respective feature folders, e.g. `src/features/testing/screens/TestingScreen.tsx`? The feature-folder approach is more consistent with the existing architecture.
- **Files:** `App.tsx` + new screen component files.
- **Approach:** Extract one `if (screen === Screen.X)` block at a time → move only JSX, keep handlers in `useAnaestheticApp` → run the Playwright E2E suite after each extraction as the regression guard.
- **Acceptance:** `App.tsx` < 200 lines; no inline JSX for any individual screen; Playwright E2E unchanged and green.
- **Do NOT:** introduce react-router. The custom `Screen` enum navigation is intentional and appropriate for this single-device, single-user app.

### OI-2: Replace `handleSubmit` JSON round-trip with a Zod schema parse
**Priority:** Medium · **Effort:** M · **Risk:** Medium

`useTestingState.handleSubmit` serializes to JSON and re-parses, then manually re-coerces every field to its type (~50 lines). It's a defensive guard against corrupted localStorage data, but it's a large maintenance surface — every new field needs a new coercion line. `zod` is already a dependency.

- **Target:** A `LogFormData` Zod schema; `handleSubmit` < 30 lines, parsing through the schema.
- **Open question (from audit):** validate on **save** (`handleSubmit`), on **load** (`getIfFresh` read path), or both? The restore path is arguably the real trust boundary since that's where untrusted localStorage data re-enters React state.
- **Files:** `src/features/testing/types.ts`, `src/features/testing/hooks/useTestingState.ts`.
- **Acceptance:** schema parse throws a typed error on invalid data; existing behavior preserved; the v0.66.0 `useTestingState` tests stay green as the regression guard (they already cover this path to 100%).
- **Note:** the v0.66.0 tests around `handleSubmit` are the safety net that makes this refactor low-stress — lean on them.

---

## Milestone 3 — Quality & Polish

### OI-3: Split `TestingLogForm.tsx` into section sub-components
**Priority:** Medium · **Effort:** L · **Risk:** Low

`TestingLogForm.tsx` (769 lines, ~37% coverage) is the primary clinical data-entry surface. Each logical section is an extraction candidate.

- **Target:** `TestingLogForm.tsx` < 250 lines; extract `ControlsSection`, `DrugTestPanel`, `NurseNotesSection`, `TryptaseSection` (`ChallengeSection` already exists as its own component).
- **Files:** `src/features/testing/components/TestingLogForm.tsx` + new section files.
- **Acceptance:** each sub-component renders independently; no behavior change; Playwright E2E green.
- **Note:** mechanical split — move JSX and the props each section needs, don't relocate logic.

---

## Status Snapshot

| ID | Item | Milestone | Effort | Risk | Status |
|----|------|-----------|--------|------|--------|
| OI-0 | Narrow `data/` gitignore rule | Hygiene | S | Low | Outstanding |
| OI-1 | Decompose `App.tsx` routing | 2 | L | Medium | Outstanding |
| OI-2 | Zod schema parse for `handleSubmit` | 2 | M | Medium | Outstanding |
| OI-3 | Split `TestingLogForm.tsx` | 3 | L | Low | Outstanding |

**Already shipped in v0.66.0:** draft-restore bug fix (M1-1), `useTestingState`/`TestingService`/`isTestingSessionDirty` tests (M0), form-handler type safety (M2-3), CI coverage gate (M1-2), full E2E draft-restore test (M3-2), warn-on-silent-catch (QW2).

---

## Open Product Questions (carried from audit)

1. **Draft restore scope:** Should an in-progress draft restore on every load, or only when the restored draft's MRN matches the currently selected patient? v0.66.0 removed the (broken) pathname guard so it now restores on any load within the 6h TTL — confirm that's the desired behavior.
2. **Coverage target ratchet:** v0.66.0 set the `src/features/testing/**` threshold near current levels to lock in the floor. Raise toward 80% as OI-1/OI-3 add testable seams?
3. **Screen extraction location (OI-1):** `src/core/screens/` vs. per-feature `screens/` folders.
4. **Zod validation boundary (OI-2):** save path, load path, or both.
