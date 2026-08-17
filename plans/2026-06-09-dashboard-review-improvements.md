# Dashboard review — UI / UX / content improvements

**Date:** 2026-06-09
**Author:** review by Claude (Opus), for handoff
**Scope:** Dashboard page (`src/features/dashboard/**`) — accessibility, dead-code
removal, data-integrity fixes, and UI consistency. No clinical grading-rule changes.
**Status:** ready to implement, except items explicitly marked "FLAG — needs decision"

---

## Context

The Dashboard is the clinic's main analytics + record-browsing screen. A full read
of `Dashboard.tsx`, the `useDashboardAnalytics` hook, and every panel
(`AnalyticsPanel`, `PatientTable`, `RecentTestingActivity`, `SkinTestBreakdown`)
surfaced four classes of issue: (1) headline stats use inconsistent/❓ denominators
and conflate record types, (2) the page lags the app's WCAG 2.1 AA bar
(non-semantic headings, mouse-only interactive tables, no reduced-motion support),
(3) ~360 lines of dead/duplicated analytics + chart code, and (4) some
design-language drift. This plan fixes the safe items and flags the clinical/product
decisions rather than guessing them.

Reference patterns to reuse: `PatientTable.tsx` already does the correct
keyboard-accessible mobile-card pattern (`role="button"`, `tabIndex`, `onKeyDown` —
lines 279-288) and `scope="col"` headers (lines 168-172). The `status-grade*`
tokens and `tabular-nums` usage in `AnalyticsPanel` are the house style.

---

## Part A — Accessibility (align with the existing WCAG work)

### A1. Make dashboard card titles real headings
`CardTitle` renders a `<div>` (`components/ui/card.tsx:32-42`), so the only heading
on the page is the app-header `<h1>` (`ScreenLayout.tsx:128`). Give each dashboard
section a programmatic heading at `<h2>` so SR users can navigate the six sections.
- Preferred: support an `as`/`asChild` prop on `CardTitle` (or accept a heading
  level) and pass `as="h2"` for the dashboard cards: Overview, Severity
  Distribution, Top Suspected Agents (AnalyticsPanel), REDCap Record Database
  (PatientTable), Recent Skin Testing Activity, Positive Skin Test Breakdown.
- Keep visual styling identical; this is semantics only. Verify no heading-order
  regression elsewhere that reuses `CardTitle`.

### A2. Keyboard-operable interactive tables
- `RecentTestingActivity` rows are clickable but mouse-only
  (`RecentTestingActivity.tsx:48-53`). Add `role="button"`, `tabIndex={0}`,
  `onKeyDown` (Enter/Space) and an `aria-label` (e.g. "View testing log for
  {name}"), mirroring `PatientTable.tsx:279-288`.
- `SkinTestBreakdown` category rows toggle expand on click but are mouse-only
  (`SkinTestBreakdown.tsx:80-84`). Make the toggle a real `<button>` (or row with
  button semantics) exposing `aria-expanded={isExpanded}` and keyboard support.

### A3. Add `scope="col"` to the remaining tables
`RecentTestingActivity` (`<th>` at lines 27-30) and `SkinTestBreakdown`
(lines 63-69) headers lack `scope="col"` that `PatientTable` already has. Add it for
consistent table semantics.

### A4. Respect `prefers-reduced-motion`
`useCountUp` (`src/shared/hooks/useCountUp.ts`) always animates. Short-circuit to the
final value when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
Also gate the chart width transitions / `animate-section-reveal` so reduced-motion
users get the final state immediately (check whether the global CSS already has a
reduced-motion block to extend).

## Part B — Remove dead / duplicated code

### B1. Delete unused chart components
`GradeDistributionChart.tsx` and `TopAgentsChart.tsx` have **zero imports**
(`AnalyticsPanel` reimplements both inline). Confirm with a repo-wide search, then
delete both files.

### B2. Delete the unused AnalyticsService
`src/features/dashboard/services/AnalyticsService.ts` (211 lines) and its
`services/index.ts` barrel are **not consumed anywhere** — `useDashboardAnalytics`
is the live implementation. Confirm no imports, then remove the `services/` folder.
(If any of its logic is genuinely better than the hook's, port it first — but
default is delete to stop the drift.)

### B3. Tidy
Remove the duplicated `// --- Analytics Calculation ---` comment
(`Dashboard.tsx:48-49`).

## Part C — Data integrity (headline stats)

### C1. Consistent rate denominators
`severeRate` uses `totalPatients` (existingPatients + recentLogs) while
`abandonedRate` uses `existingPatients.length` (`Dashboard.tsx:64-71`). Pick one
denominator and use it for both, and make the numerator's population match the
denominator's. Document the chosen definition in a comment.

### C2. **FLAG — needs product decision:** what counts as a "Record"?
`totalPatients = existingPatients.length + recentLogs.length`
(`useDashboardAnalytics.ts:20`) mixes imported REDCap records with this-session
logs, but the KPI is labelled "Records" and sits above the "REDCap Record Database"
table (which shows `existingPatients` only) — so the number won't match the table.
Options for the user: (a) count REDCap records only, (b) keep combined but relabel
(e.g. "Records + session logs"), or (c) show both separately. Do not change
silently.

### C3. **FLAG — needs clinician sign-off:** session-log severity heuristic
`recentLogs` are graded by `UNSUCCESS` + `interventionType === 'Adrenaline'` →
Grade III, else Grade I, else Ungraded (`useDashboardAnalytics.ts:105-116`). This
can misstate the severity distribution and the severe count/rate. Surface for
clinical review; don't re-grade without sign-off.

### C4. Minor: clarify the "Onset" KPI
Add an "avg" qualifier or a tooltip explaining it's the mean induction→reaction
time (capped 0–240 min, `useDashboardAnalytics.ts:73`).

## Part D — UI consistency / responsive

### D1. Normalize chip + header styling
- `RecentTestingActivity` negative chips use `rounded border`
  (`RecentTestingActivity.tsx:59`) — switch to the app's `rounded-none`.
- Unify the three section-card header backgrounds (PatientTable uses
  `bg-slate-50/50 dark:bg-muted/20`; RecentTestingActivity uses
  `bg-slate-50 dark:bg-card/10`) to one treatment.

### D2. SkinTestBreakdown on mobile
The 7-column table only scrolls horizontally on phones. Provide a mobile-friendly
layout (stacked per-drug cards, or at minimum keep the category accordion usable and
add a scroll affordance), following the PatientTable desktop-table / mobile-card
split.

### D3. Timeline-dot legend (lower priority)
PatientTable timeline dots (`PatientTable.tsx:216-229`) are colour-only with a hover
`title`. Add a small legend (induction / reaction / medication) and ensure the cue
isn't colour-only — helps colour-blind and touch users.

## Files
- `src/features/dashboard/components/Dashboard.tsx` (comment tidy, denominator fix)
- `src/features/dashboard/hooks/useDashboardAnalytics.ts` (denominator/population,
  the two FLAG items once decided)
- `src/features/dashboard/components/AnalyticsPanel.tsx`,
  `PatientTable.tsx`, `RecentTestingActivity.tsx`, `SkinTestBreakdown.tsx` (headings,
  keyboard a11y, scope, chip/header normalization, mobile)
- `components/ui/card.tsx` (optional `as`/heading-level support for `CardTitle`)
- `src/shared/hooks/useCountUp.ts` (reduced-motion)
- **Delete:** `GradeDistributionChart.tsx`, `TopAgentsChart.tsx`,
  `services/AnalyticsService.ts`, `services/index.ts`

## Tests
- Extend `Dashboard.test.tsx`: section headings exist at the right level; Recent
  Testing Activity row is activatable by keyboard; SkinTestBreakdown toggle exposes
  `aria-expanded` and works via keyboard; the chosen rate definition produces the
  expected percentage on the mock data.
- If `useCountUp` gains reduced-motion logic, add a unit test mocking `matchMedia`.
- A11y: extend the existing axe e2e coverage to the dashboard if not already there.

## Verification
1. `npm run test:unit` — new/updated tests pass; existing suites green.
2. `npx tsc --noEmit` + `npm run lint` clean.
3. `npm run dev`: tab through the dashboard — every section reachable as a heading,
   both interactive tables operable by keyboard, count-up respects reduced motion
   (toggle OS setting), SkinTestBreakdown usable on a narrow viewport.
4. Confirm the "Records"/severe/abandoned numbers are internally consistent and the
   Records KPI matches whatever C2 decision is made.
5. `npm run build` succeeds; confirm bundle shrinks after dead-code removal.

## Out of scope
- Changing clinical grading thresholds or the session-log severity rule without
  sign-off (C3) — flag only.
- New analytics/metrics beyond fixing what exists.

## Suggested release
One minor bump (e.g. v0.61.0). The two FLAG items (C2, C3) may need to be resolved
with the user/clinician before that release or split into a fast follow.
