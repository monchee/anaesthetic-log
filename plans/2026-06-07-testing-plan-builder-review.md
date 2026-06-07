# Testing Plan / Request Form builder — review & improvement suggestions

**Date:** 2026-06-07
**Author:** review by Claude (Opus), for handoff
**Target file:** `src/features/testing/components/TestingPlanGenerator.tsx`
(rendered at `App.tsx:512` on the LOG screen)
**Status:** review / backlog — implementing any item is a separate, approved change

---

## Context

The "Testing Plan / Request Form" card is where a clinician builds the testing
plan: pick drugs by category, add custom drugs with inline SPT/IDT protocols, set
reaction date + urgency, tick documents-to-chase, add notes, then "Preview &
Print Plan". It got a visual-polish pass in v0.54.0 but has never had a
functional/UX/clinical review. This document is that review, prioritised.

## How it works today (verified)
- All builder state is local `useState` (drugs, customs, notes, urgent, date,
  docs). Initial drug selection = `DEFAULT_SELECTED_DRUGS` (`["Chlorhexidine",
  "Latex"]`) ∪ REDCap `history.testingPlan` (if present) ∪ fuzzy matches from
  reaction history.
- On "Preview", `handlePreview` (`TestingPlanGenerator.tsx:112`) lifts a
  `TestingPlanData` to `App` state and routes to `PRINT_PLAN`.
- Drugs are grouped by `DRUG_CATEGORIES`; the masterlist (`drugMasterlist.ts`)
  has ~116 protocol entries and many drugs carry **multiple** protocols/
  presentations.

---

## P1 — Functional / clinical gaps (highest value)

### P1.1 — Protocol selection is a dead feature
`handlePreview` always sends `selectedProtocols: {}` (`TestingPlanGenerator.tsx:115`;
also `src/test/factories/testingDataFactory.ts`). But every consumer reads
`selectedProtocols?.[drug] ?? 0` — `TestingPlanPrintView.tsx:192,246`,
`testingPlanFormatter.ts:60`, and `App.tsx:81` (`handleProceedToTesting`). So for
any drug with >1 protocol the user **silently always gets protocol #0**, with no
way to choose — and the printed document even renders the `(protocolLabel)` hint,
implying a choice exists.
**Suggest:** add a per-drug protocol picker in the builder for multi-protocol
drugs (segmented control / small `Select`) that writes `selectedProtocols[drug] =
index`. If single-protocol is the clinical intent, instead remove the dead field
and the `(protocolLabel)` hint so nothing implies a choice.
**Decision needed (clinical):** multi-protocol picker vs. single-protocol-by-design.

### P1.2 — The plan builder is not saved as a draft
Builder state is purely local `useState`; leaving the LOG screen (to glance at
Dashboard, or on a service-worker update) discards the whole plan — selected
drugs, custom protocols, notes. v0.53.0 added 6h-TTL draft autosave for the
testing *session* form (`TESTING_DRAFT_KEY` in `ttlStorage.ts`) but **not** for
this builder.
**Suggest:** persist builder state to `ttlStorage` keyed per patient (reuse the
existing TTL pattern) and restore on remount, so an interrupted plan survives.

### P1.3 — Custom-drug remove control is invalid / inaccessible markup
The custom-drug chip is a `<button onClick={toggle}>` that **contains a
`<span onClick={remove}>`** (`TestingPlanGenerator.tsx:324-341`). Interactive
content nested inside a `<button>` is invalid HTML, the remove "×" is not
keyboard-focusable, and screen readers can't disambiguate toggle-vs-remove.
**Suggest:** split into two sibling real buttons (toggle + remove), or make the
chip a container holding two `<button>`s.

---

## P2 — UX / usability

### P2.1 — No visible count/summary of what's selected
Collapsed, the header only says "Select drugs to generate a printable testing
plan"; expanded, there's no running total. A clinician can't tell at a glance how
many/which drugs are in the plan.
**Suggest:** show a count badge in the header (e.g. "12 drugs") and/or a compact
selected-summary so plan size is always visible.

### P2.2 — "Clear All" is a one-click destructive wipe
`:221-229` clears all selected + custom drugs (including history-auto-selected and
pinned defaults) with no confirm/undo.
**Suggest:** confirm via the existing `components/ui/confirm-dialog.tsx`, or offer
"Reset to defaults" instead of a total wipe, or an undo toast.

### P2.3 — Custom-drug entry has no dedupe / known-drug nudge
`addCustomDrug` (`:73`) accepts any string, including a name already in the
masterlist or an existing custom — creating confusing duplicates on the document.
**Suggest:** case-insensitive dedupe against masterlist + existing customs; if a
known drug is typed, nudge "select it from its category instead".

### P2.4 — Builder starts collapsed every time
`isOpen` defaults `false` (`:37`), so the primary action on the patient screen
always needs an extra click to open.
**Suggest:** default open once a patient is selected (or remember last state).

---

## P3 — Accessibility & polish

- **P3.1 — Toggle buttons lack `aria-pressed`.** Drug select buttons (`:284`)
  convey state via colour + a `Check` icon but don't expose pressed state to AT.
  Add `aria-pressed={selected}`.
- **P3.2 — Icon-only signifiers learned only from a bottom legend.** Pin
  (pre-filled) and History (given at reaction) icons have `aria-label`s but their
  meaning lives in the legend below the grid (`:394`). Add tooltips on the icons,
  and/or move the legend above the grid.
- **P3.3 — Reaction date unbounded.** The date input (`:166`) has no `max`; a
  future date is accepted. Add `max={today}`.
- **P3.4 — Urgent toggle has redundant handlers.** The wrapper `div onClick`
  (`:174`) and the `Switch onCheckedChange` (`:175`) both fire on a switch click.
  It nets out correctly today but is fragile — drop the wrapper handler and rely
  on the `Switch` + `Label htmlFor`.
- **P3.5 — Fuzzy history matching can over-select.** `historyDrugs` matches by
  bidirectional substring (`:21-23`), which can mis-match short names. Low risk;
  consider tightening to word/exact matches.

---

## Recommended first slice
P1.1 (protocol selection — decide fix-or-remove with the clinician), P1.2 (draft
persistence), and P1.3 (remove-button a11y) deliver the most clinical/UX value and
are self-contained. P2.1 (selection count) is a cheap, high-visibility win to
bundle in.

## Verification (when implemented)
- `npm run dev`, PIN `2050`, select a patient with multi-protocol drugs; confirm a
  protocol picker drives both the document and the testing session (P1.1).
- Build a plan, navigate to Dashboard and back; confirm it restored (P1.2).
- Keyboard-only: Tab to a custom drug; confirm toggle and remove are both
  reachable and announced (P1.3); confirm drug buttons announce pressed state
  (P3.1).
- `npm run lint` + `npm run build` clean; extend axe e2e coverage on the LOG
  screen with the builder expanded.

## Out of scope
- The printed document (`TestingPlanPrintView.tsx`) — separately reviewed and
  fixed in v0.55.0 (see `plans/2026-06-07-testing-plan-document-polish.md`).
- Drug protocol data / clinical concentrations in `drugMasterlist.ts`.
