# DREAM App UI, UX, Design, and Typography Improvement Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Date:** 2026-06-07  
**Status:** Reviewed and revised (2nd pass: reconciled with v0.53.1–v0.55.0)  
**Scope:** First-run UX, navigation behavior, mobile navigation, typography, accessibility, dashboard polish, research empty state, reports, and footer presentation.  
**Goal:** Fix the workflow blockers first, then refine the clinical UI so it remains calm, dense, readable, and trustworthy.

## Plan Review Summary

The merged plan had the right findings, but it mixed urgent bugs with visual polish. That would make implementation harder to sequence and harder to verify. This revision separates the work into shippable phases:

1. **Stabilize app entry and navigation.**
2. **Improve responsive navigation and accessibility primitives.**
3. **Tighten clinical hierarchy and dashboard scanability.**
4. **Polish lower-risk document and footer surfaces.**

## Design Review Scores

| Dimension | Current Plan Score | What Needed Revision |
| --- | ---: | --- |
| Problem priority | 7/10 | Correct issues, but blockers and polish were mixed together. |
| UX clarity | 7/10 | Needed clearer route, modal, and mobile-nav behavior decisions. |
| Visual-system direction | 8/10 | Sensible restraint, but radius/font decisions needed stronger guardrails. |
| Implementation readiness | 6/10 | Needed file targets, release slices, and acceptance checks per phase. |
| Verification coverage | 7/10 | Good checklist, but needed per-phase regression tests and browser checks. |

Target after this revision: **9/10**. The plan is now implementation-ready without committing the team to unnecessary redesign work.

## Product Principles

- **Clinical utility over decoration:** preserve dense, operational layouts.
- **Do not hijack navigation:** help and onboarding must not change the user’s route unexpectedly.
- **No broad restyle first:** fix blockers before visual-system changes.
- **Typography should clarify work:** hierarchy should help clinicians scan, not create a marketing feel.
- **Accessibility is product quality:** visible focus, contrast, and dialog behavior are non-negotiable.

## Explicit Decisions

- **Keep `Public Sans`.** Do not add `Outfit` or another display font unless a NSW Health or local brand requirement explicitly supports it.
- **Keep square clinical surfaces.** Tables, inputs, clinical forms, and data grids should stay crisp and utilitarian.
- **Use radius selectively.** If radius is introduced, apply it only to transient layers such as dialogs, menus, popovers, sheets, and toasts.
- **Split implementation.** Ship modal/route fixes before mobile nav, typography, reports, or footer work.
- **Keep report-content changes out of scope.** Report copy and clinical meaning should not change in this visual pass.

## Already Shipped — Reconcile Before Starting

This plan predates three releases. Re-check current `main` before each phase so you do not redo shipped work:

- **v0.53.1 (WCAG 2.1 AA audit).** Tryptase switch `aria-label`s, Privacy Policy heading order (h4→h2), PasswordGate promoted to a `<main>` landmark, and axe-core e2e coverage extended to Home, Dashboard, Testing form, Research, Changelog, Privacy, and the PIN gate. → Treat Phases 2.2/2.3 as *verifying the gaps the audit did not cover*, not a from-scratch accessibility pass.
- **v0.54.0 (PatientTable + card polish).** Desktop patient rows already use a semantic `<button type="button">` (`PatientTable.tsx:194-202`); card-level visual polish unified raw slate surfaces to theme tokens and applied `rounded-none`. → Phase 3.2's row-affordance work is mostly done on desktop; see the narrowed scope there.
- **v0.55.0 (Testing Plan document).** Print/B&W/accessibility overhaul of the testing plan *document* (`TestingPlanPrintView.tsx`): per-page patient-ID running header/footer, black-and-white-safe banners/badges, heading order, `scope="col"`. This is a *different* surface from the reports in Phase 4.2, but apply the same print-preview verification method (greyscale check for the B&W clinic printer).
- **Reusable primitive:** `components/ui/confirm-dialog.tsx` already exists — reuse it if any phase needs a confirmation dialog; do not build a new one.

## Phase 1: Entry Flow and Navigation Blockers

### 1.1 Fix Quick Start dialog dismissal

**Problem:** The Quick Start dialog can remain visible and focusable after dismissal. During review, it had `data-state="closed"` while still occupying layout, accepting pointer events, and remaining in the accessibility tree.

**Likely files:**

- `components/ui/dialog.tsx`
- `src/core/components/HelpModal.tsx`

**Implementation notes:**

- **Re-verify the symptom against current `main` first** — no fix has landed, but the "stays focusable after close" behaviour was not reproducible in a quick pass. The shared `dialog.tsx` uses standard Radix; if persistence still occurs it is more likely in how `HelpModal` mounts than in the primitive. (An `e2e/debug-sonner.spec.ts` was present earlier, suggesting this was already under investigation.)
- Investigate the shared dialog primitive before patching feature code.
- Do not use a brute-force global `display: none` workaround that breaks Radix exit behavior.
- Ensure closed dialog overlay and content are not pointer-active, visible, or exposed to assistive tech.
- Confirm the close icon, `Skip for now`, and Escape all produce the same final state.

**Acceptance criteria:**

- Closing Quick Start leaves no visible overlay.
- No visible `[role="dialog"]` remains after close.
- Keyboard focus returns to a sensible element.
- The app can be used normally after closing the dialog.

**Regression coverage:**

- Add focused browser or component coverage for:
  - close icon
  - `Skip for now`
  - Escape key
  - absence/hidden state of dialog after close

### 1.2 Stop HelpModal from changing routes

**Problem:** `HelpModal` currently changes screen to Home when it auto-opens. Directly loading `/dashboard` or `/research` in demo mode should not route the user back to Home.

**Likely file:**

- `src/core/components/HelpModal.tsx`

**Implementation notes:**

- Remove implicit `setScreen(Screen.LOG)` from the auto-open effect.
- Keep Quick Start scoped to the current route.
- If a Home route is useful, make it an explicit button in the modal.
- Keep manual Quick Start access from Menu.

**Acceptance criteria:**

- Direct load of `/dashboard` stays on Dashboard.
- Direct load of `/research` stays on Research.
- Quick Start can still open manually.
- Demo upload guidance remains available without route hijacking.

**Regression coverage:**

- Add tests for direct route loading:
  - `/dashboard`
  - `/research`
  - `/`

## Phase 2: Mobile Navigation and Core Accessibility

### 2.1 Improve mobile navigation clarity

**Problem:** At mobile widths, navigation becomes icon-only square buttons. The controls meet size requirements, but visual meaning and active state are not clear enough.

**Likely file:**

- `src/core/components/ScreenLayout.tsx`

**Implementation notes:**

- Keep icons, but expose a visible label for the active route on mobile.
- Keep all nav controls at least 44px tall.
- Avoid hover-only affordances for mobile.
- Preserve the compact header footprint.

**Preferred pattern:**

- Mobile header top row: app or screen title.
- Mobile nav row: Home, Dashboard, Research, Menu as icons.
- Active item shows a short visible label, not only a background change.

**Acceptance criteria:**

- At `390px` width, the current section is visually clear.
- Header controls do not overflow at `360px` width.
- Active state language is consistent across mobile and desktop.

### 2.2 Normalize focus visibility

**Problem:** Focus styles are distributed across primitives and can be too subtle or inconsistent for a clinical workflow.

**Likely files:**

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/switch.tsx`
- `components/ui/tabs.tsx`
- `index.css`

**Implementation notes:**

- A global treatment already exists (`index.css:11` `*:focus-visible` and `:17` `*:focus:not(:focus-visible)`). **Audit and strengthen the existing rule** rather than creating a new one; confirm it is visible enough in light and dark on every primitive below.
- Keep component-specific focus styles only where the global treatment is insufficient.
- Do not remove focus styles without replacing them with a visible equivalent.

**Acceptance criteria:**

- Keyboard focus is clear on buttons, inputs, checkboxes, switches, tabs, dropdown items, and dialog controls.
- Focus rings are visible in light and dark mode.
- Disabled controls remain visually distinct and non-interactive.

### 2.3 Verify contrast-sensitive UI states

**Problem:** Grade badges, muted chart text, and report result colors need explicit contrast review. **Baseline:** the v0.53.1 WCAG 2.1 AA audit already covered general a11y — treat this as verifying the contrast cases it did not (grade badges on orange, chart-legend muted text, dark-mode result colours).

**Likely files:**

- `components/ui/badge.tsx`
- `src/features/dashboard/components/AnalyticsPanel.tsx`
- `src/features/reports/components/PatientHandout.tsx`
- `src/features/reports/components/ClinicalReport.tsx`

**Implementation notes:**

- Verify `grade3` contrast against orange backgrounds.
- Check muted text in chart legends and table metadata.
- Check dark-mode positive and negative result text in reports.

**Acceptance criteria:**

- Badge and status text meet WCAG AA where practical.
- Muted metadata remains readable in realistic clinic lighting.
- Dark-mode report result colors are legible.

## Phase 3: Clinical Hierarchy and Dashboard Scanability

### 3.1 Tighten typography hierarchy

**Problem:** Page titles, card titles, labels, and table text are close in visual weight. Borders currently do too much structural work.

**Likely files:**

- `tailwind.config.js`
- `index.css`
- `components/ui/card.tsx`
- `src/core/components/ScreenLayout.tsx`
- dashboard and testing form components that use dense labels

**Implementation notes:**

- Keep `Public Sans`.
- Define a compact operational type scale:
  - page title: prominent but not hero-sized
  - section/card title: `16-18px`, medium or semibold
  - control labels: `13-14px`, readable without excessive uppercase
  - table metadata: `12-13px`, adequate contrast
  - numeric KPIs: tabular numerals
- Reduce excessive uppercase and wide tracking where it slows reading.

**Acceptance criteria:**

- Users can visually distinguish page title, section title, label, and metadata.
- Dense clinical forms remain compact.
- No new external font dependency is introduced.

### 3.2 Improve dashboard metrics and charts

**Problem:** The dashboard is strong, but chart interpretation and metric stability can improve. **Note:** v0.54.0 already made the **desktop** patient rows a semantic `<button>` (`PatientTable.tsx:194-202`), so remaining affordance work is the **mobile card** (still a `<div onClick>` with no keyboard role, `~PatientTable.tsx:273`). `tabular-nums` is **not yet** used in the dashboard (only `sidebar.tsx`).

**Likely files:**

- `src/features/dashboard/components/AnalyticsPanel.tsx`
- `src/features/dashboard/components/GradeDistributionChart.tsx`
- `src/features/dashboard/components/TopAgentsChart.tsx`
- `src/features/dashboard/components/PatientTable.tsx`

**Implementation notes:**

- Add `tabular-nums` to metric values and chart counts (not present yet).
- Align severity legend colors with severity semantics.
- Add accessible labels or titles for chart segments where useful.
- Give the **mobile** patient card the same keyboard affordance the desktop row already has (semantic `<button>` or `role`/`tabIndex` + key handler); desktop is done.

**Acceptance criteria:**

- Count-up animation does not create visible horizontal jitter.
- Severity distribution can be understood without guessing.
- Table row interaction is obvious for mouse and keyboard users.

### 3.3 Clarify Research empty state

**Problem:** The Research screen empty state is visually clean but under-informative. It should distinguish unconfigured Supabase, demo mode, offline state, and permission failure where possible.

**Likely file:**

- `src/features/research/components/ResearchDashboard.tsx`

**Implementation notes:**

- Rewrite the empty state around the actual condition.
- Add short status lines, for example:
  - `Research database: not configured`
  - `Demo mode: local patient dataset only`
- Keep the setup CTA.
- Avoid unexpected route changes when linking to documentation.

**Acceptance criteria:**

- A clinician understands why Research is unavailable.
- The next action is obvious.
- The page does not look broken when Supabase is absent.

## Phase 4: Visual-System Polish

### 4.1 Refine sharp-edge layering

**Problem:** The zero-radius system is coherent, but using it everywhere makes overlays, cards, buttons, and forms feel too similar.

**Likely files:**

- `tailwind.config.js`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/popover.tsx`
- `components/ui/sheet.tsx`
- `components/ui/sonner.tsx`

**Implementation notes:**

- Keep square edges for primary clinical work surfaces.
- Consider small, explicit radius tokens for overlays only.
- Avoid changing every card or button radius in one pass.

**Acceptance criteria:**

- Overlays and popovers read as distinct layers.
- Clinical data surfaces still feel precise and utilitarian.
- The UI no longer depends only on shadows and borders to show depth.

### 4.2 Polish report and handout surfaces

**Problem:** Report views should read more like clinical documents than nested dashboards.

**Likely files:**

- `src/features/reports/components/PatientHandout.tsx`
- `src/features/reports/components/ClinicalReport.tsx`
- `src/features/reports/components/PowerchartLetter.tsx`

**Implementation notes:**

- Replace nested grey card containment with simpler dividers where appropriate.
- Preserve print layout.
- Do not change clinical content.
- Verify light mode, dark mode, and print preview.

**Acceptance criteria:**

- Patient-facing and clinician-facing report surfaces read as documents.
- Print preview remains clean.
- Positive and negative result colors are legible.

### 4.3 Refine footer layout

**Problem:** The footer is functional, but centered stacked link rows feel less polished than the rest of the app.

**Likely file:**

- `src/core/components/Footer.tsx`

**Implementation notes:**

- Move toward an edge-aligned colophon:
  - left: RPAH branding, clinic description, app version
  - right: grouped navigation and legal/resource links
- Keep all link targets unchanged.
- Preserve dataset and version visibility.

**Acceptance criteria:**

- Footer feels integrated with the product system.
- Links remain easy to scan and tap.
- Mobile footer remains readable.

## Implementation Order

1. **Phase 1A:** Fix shared dialog dismissal.
2. **Phase 1B:** Remove route mutation from `HelpModal`.
3. **Phase 1C:** Add modal and direct-route regression tests.
4. **Phase 2A:** Improve mobile active navigation labeling.
5. **Phase 2B:** Normalize focus visibility and contrast-sensitive states.
6. **Phase 3A:** Tighten typography hierarchy and add tabular numerals.
7. **Phase 3B:** Polish dashboard charts/table affordance.
8. **Phase 3C:** Clarify Research empty state.
9. **Phase 4A:** Refine overlay radius/layering if still valuable after Phase 1.
10. **Phase 4B:** Polish report and handout visual structure.
11. **Phase 4C:** Refine footer layout.

Each phase should be independently reviewable. Do not bundle Phase 1 blockers with Phase 4 polish in the same change unless the repository workflow requires a single PR.

## Verification Plan

### Automated

- `npm run test:unit`
- `npx tsc --noEmit`
- `npm run lint`
- Focused regression coverage for:
  - Quick Start close icon
  - Quick Start `Skip for now`
  - Quick Start Escape key
  - direct `/dashboard` load
  - direct `/research` load
  - mobile nav active state
  - visible focus behavior on key primitives where feasible

### Manual Visual QA

Test these viewports:

- Desktop: `1280x720`
- Laptop: `1440x900`
- Mobile: `390x844`
- Mobile narrow: `360x740`

Check:

- no modal persistence after close
- no route hijack from HelpModal
- no horizontal overflow
- active route is clear
- dashboard cards and tables remain readable
- dark mode keeps enough contrast
- keyboard focus remains visible
- Research empty state explains the actual condition
- report print preview remains clean

### Browser-Test Caveat

Before trusting local browser or Playwright results, confirm the app is actually serving DREAM on the intended port. As a general caution, local browser tests can be misleading when the server target does not match the expected app — verify the served page is DREAM (e.g. check the title/version) before relying on the results.

## Out of Scope

- Full brand redesign.
- Marketing-style hero sections.
- New illustrations.
- Replacing the dashboard information architecture.
- Adding a new font family without a brand requirement.
- Changing report clinical content or patient-facing clinical meaning.
- Reworking Supabase/research data architecture beyond empty-state messaging.

