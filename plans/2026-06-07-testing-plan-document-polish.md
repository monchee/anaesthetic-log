# Testing Plan Document — Review & Polish (incl. B&W print)

**Date:** 2026-06-07
**Author:** review by Claude (Opus), for handoff to an implementing agent
**Target file:** `src/features/testing/components/TestingPlanPrintView.tsx`
(plus a small `@media print` addition in `index.css`)
**Status:** ready to implement

---

## Context

`TestingPlanPrintView` is the document a clinician generates from the "Testing
Plan / Request Form" card (LOG screen → expand card → "Preview & Print Plan" →
`/print-plan`). It is **the artifact the clinic actually prints and hands to the
allergy nurses**, and **the clinic printer is black & white**. So the page has
two hard requirements: render coherently on screen (light + dark), and produce a
correct, legible, unambiguous A4 form on a B&W laser printer.

This plan was written after inspecting the **live v0.54.0 deployment**: I drove
the real flow (PIN 2050 → patient "Fatima Al-Sayed" → urgent + Tryptases →
Preview & Print Plan), generated the actual print PDF (Chromium print CSS, A4),
and converted page 1 to grayscale (ColorSync Generic Gray profile) to simulate
the B&W printer. Findings below are grounded in that output.

**Print output observed:** 2 A4 pages. Page 1 = title, urgent banner, patient
banner, documents-to-chase, skin-testing panel (Muscle Relaxants, Cephalosporins,
Hypnotics). Page 2 = Opioids, Antiseptics, Others, Challenge/Desensitisation
table, sign-off + signature lines. Category cards use `break-inside-avoid` and do
**not** split mid-card — pagination is clean. App chrome (header/footer) is
correctly `no-print`.

---

## Findings

### CRITICAL — clinical safety

**C1 — Page 2 has no patient identifier.** Confirmed in the print PDF: page 2
begins straight at "OPIOIDS" with no name/MRN anywhere on it. If the pages are
physically separated (routine in a clinic), page 2 is unattributable — a real
patient-safety gap.

**C2 — No page numbering** ("Page 1 of 2"). Same separation risk.

### HIGH — black & white printer legibility (clinic uses B&W)

These rely on **color alone** and degrade badly in grayscale:

**BW1 — URGENT banner relies on red.** `bg-red-600 text-white` (`:61`). In B&W
it becomes an undistinguished **medium-gray bar** that reads like just another
section header — the urgency signal is lost. Fix: make it survive B&W via a
non-color treatment — solid **black** background + white text (prints as a strong
solid bar), or a thick black border + bold/larger text + the warning glyph.
Recommended: `print:bg-black print:text-white` with a `print:border-2
print:border-black`, keep red on screen.

**BW2 — "Documents to Chase" amber badges wash out.** `bg-amber-50
border-amber-300 text-amber-800` + `print:bg-amber-50 print:text-amber-800`
(`:109,115,121`). In grayscale the amber-50 fill → near-white and amber-800 text
→ faint mid-gray; the badges are hard to read. This is actionable info (what to
go chase). Fix for print: high-contrast outline badges — `print:bg-white
print:border print:border-black print:text-black` (drop the amber square bullet
or make it black). Keep amber on screen.

**BW3 — Patient name renders gray.** "Fatima Al-Sayed" is `text-primary` (`:71`)
→ medium gray in B&W. The single most important identifier should be the
highest-contrast text on the page. Fix: `print:text-black` (+ keep bold). Same
applies to category headers (`:173` etc., `text-primary`) and section-title
text — consider `print:text-black` on those for crisper B&W.

**BW4 — Fill-in-the-blank result lines are gray.** Every result underline uses
`border-gray-400 print:border-gray-500` (reference controls `:159`; SPT/IDT
result cells `:199,209,248,258,344,369`; sign-off/signature `:392,401,405`).
gray-500 prints faint on a laser printer, and these are lines a nurse writes on.
Fix: darken print blanks to black (`print:border-black`) or at least
`border-gray-700`. (Screen can stay gray-400.)

### MEDIUM — accessibility (project is at WCAG 2.1 AA, v0.53.1)

**B1 — Heading-order violation.** `ScreenLayout` already emits the page `<h1>`
("Testing Plan Preview", `no-print`, `ScreenLayout.tsx:128`). This component then
uses `<h1>` (`:48`) → `<h4>` (`:102,133,144,315`) → `<h5>` (`:173,278,325`),
skipping h2/h3 and creating a second h1. Re-level to a clean outline:
- Doc title "Anaesthetic Allergy Testing Request" (`:48`): `h1` → `h2`.
- Section headings (Documents to Chase `:102`, Clinical Notes `:133`, Requested
  Skin Testing Panel `:144`, Challenge/Desensitisation `:315`): `h4` → `h3`.
- Category headings (`:173,278,325`): `h5` → `h4`.
- Controls-bar label "Testing Plan Document" (`:33`, inside the `print:hidden`
  bar) is currently `<h3>` and visually precedes the title — demote to a
  non-heading `<p>`/`<span>` (it's a toolbar label).
- **Preserve current size/weight classes** on every retagged element so nothing
  changes visually.

**B2 — Table `<th>` missing `scope="col"`.** Both tables (`:224–228`, `:354–358`).
Add `scope="col"`. (Matches PatientTable, which keeps scope on its headers.)

**B3 — Sub-12px text on SCREEN.** `:241` renders the protocol-variant label at
`text-[8px]` on the desktop table (the mobile equivalent at `:187` correctly uses
`text-xs`). Violates the v0.52.0 "no sub-12px on-screen text" rule. Fix screen to
`text-xs`. Leave the `print:text-[9px]/[10px]` utilities — they are intentional
for A4 density.

**B4 — `border-black` signature lines invisible in dark mode** (`:401,405`).
Screen-only nit (print wants black). Use `border-foreground` (black in
light/print, visible in dark). Note this overlaps BW4 — for these two lines,
`border-foreground print:border-black` covers both.

### LOW — design-language consistency (screen)

**A1 — `rounded-lg` breaks the app's sharp `rounded-none` aesthetic.** The whole
app is `rounded-none`; this page is the lone exception — patient banner (`:68`),
category/section cards (`:171,276,323`), card headers (`rounded-t-lg`
`:172,324`). Replace all with `rounded-none`.

**A2 — Raw slate colors instead of theme tokens (dark mode).** Screen (non-print)
examples: `border-slate-200` with no dark variant (`:32`), `bg-slate-50
dark:bg-card/*` (`:32,45,68,171,323`), `bg-slate-100 dark:bg-card/50`
(`:172,277,324`), `text-slate-700/800` (~10×). Tokenize to `bg-muted`, `bg-card`,
`border-border`, `text-foreground/80`. **Do NOT touch any `print:` slate
utilities** — the printout is always light and those are deliberate.

**A3 — "Print Now" button uses raw `bg-slate-900`** (`:38`), no hover/focus/dark.
Use the default primary `Button` variant (keep the `Printer` icon).

### NOTE-ONLY (no change unless requested)

- **D1** — `handleEmail` (`:23`) builds a `mailto:` with the full plan text in the
  body; long panels can exceed client URL limits (~2000 chars) and silently
  truncate. Consider a copy-to-clipboard fallback later.
- **D2** — Request date appears 3 ways (header `:53`, signature "Date" `:406`,
  formatter "Request Date"). Cosmetic.
- **D3** — Conditional `redcapId` cell can make the patient banner a 5-cell 3-col
  grid (slightly uneven). Cosmetic.

---

## Implementation

All changes in `TestingPlanPrintView.tsx` unless noted. Keep every change
screen-safe AND print-correct; never edit existing `print:` slate utilities
except where a finding calls for it (BW1–BW4, B4).

### 1. Clinical safety — per-page running header + footer (C1, C2)
Add two **print-only** elements as early children of the outer `<Card>`, hidden
on screen (`hidden print:flex`). Chromium repeats `position: fixed` elements on
every printed page — this is the mechanism that puts the identifier on page 2+.
- **Running header** (`print:fixed top-0 left-0 right-0`, padded to page margin,
  `text-[9px]`, bottom rule): left = `{patient.firstName} {patient.lastName} ·
  MRN {patient.mrn}{patient.dob ? ` · DOB ${formatDate(patient.dob)}` : ''}`;
  right = "Anaesthetic Allergy Testing Request". Reuse `formatDate` (already
  imported from `@shared/utils`).
- **Running footer** (`print:fixed bottom-0 left-0 right-0`): left = `{lastName},
  {firstName} · MRN {mrn}`; right = page marker (see C2 caveat).
- In `index.css` `@media print`: reserve space so page-1 content doesn't sit
  under the fixed header — increase body padding (e.g. `padding: 20mm 15mm
  16mm;`). Keep `@page { margin: 0; size: A4 }`.
- **C2 caveat:** true "Page X of Y" from HTML/CSS is not reliably supported by
  Chromium's print engine. Add it as progressive enhancement via
  `@page { @bottom-right { content: "Page " counter(page) " of " counter(pages); } }`,
  but rely on the footer's repeated Name/MRN for guaranteed identifiability.

### 2. B&W print legibility (BW1–BW4) — the priority for this clinic
- **BW1 urgent banner** (`:61`): add `print:bg-black print:text-white
  print:border-2 print:border-black` (keep `bg-red-600 text-white` for screen).
- **BW2 documents badges** (`:109,115,121`): replace the amber `print:` classes
  with `print:bg-white print:border print:border-black print:text-black`; make
  the bullet square `print:bg-black` or remove it. Keep amber on screen.
- **BW3 patient name** (`:71`): add `print:text-black`. Also add `print:text-black`
  to category headers (`:173,278,325`) and section-heading text for crisp B&W.
- **BW4 result/blank lines**: change `print:border-gray-500` → `print:border-black`
  on the fill-in lines (`:159,199,209,248,258,344,369,392`) and the signature
  lines (`:401,405`, combined with B4 below).

### 3. Accessibility (B1–B4)
- Re-level headings per B1 (preserve classes); demote the controls-bar label.
- Add `scope="col"` to all `<th>` (B2).
- `:241` `text-[8px]` → `text-xs` (B3).
- Signature lines `border-black` → `border-foreground print:border-black` (B4 + BW4).

### 4. Screen consistency (A1–A3)
- `rounded-lg`/`rounded-t-lg` → `rounded-none` (A1).
- Tokenize screen raw slates (A2); leave `print:` slates alone.
- "Print Now" → default primary `Button` (A3).

---

## Verification

1. `npm run dev`, PIN `2050`, select a patient, expand **Testing Plan / Request
   Form**, toggle **Urgent** + tick **Tryptases**, keep default + a custom drug,
   add a note, click **Preview & Print Plan**.
2. **Screen, light + dark:** sharp `rounded-none` corners, coherent token
   surfaces (no light-slate borders/bg bleeding in dark), Print button has proper
   hover/focus.
3. **B&W print check (the important one):** open Chromium print preview (Cmd-P)
   and set it to **Black and white / Grayscale**, or generate the PDF and convert
   page(s) to grayscale (`sips -s format png plan.pdf --out p.png` then
   `sips -m '/System/Library/ColorSync/Profiles/Generic Gray Profile.icc' p.png
   --out p-gray.png`). Confirm: URGENT banner is a strong solid black bar;
   Documents-to-Chase badges are black-outlined and readable; patient name is
   solid black; all fill-in lines are crisp black. Nothing critical relies on
   color.
4. **Multi-page identity:** with enough drugs to span 2 pages, confirm the
   Name/MRN running header (and footer) appears on **every** page, and (best
   effort) the page-number counter.
5. **a11y:** heading outline is h1→h2→h3→h4 (axe / a11y tree); `<th scope>`
   present. Extend/keep the axe e2e coverage on the `/print-plan` screen.
6. `npm run lint` clean; `npm run build` succeeds.

## Out of scope
- `testingPlanFormatter.ts` (the plain-text/email version) — unchanged.
- Drug protocol data (`drugMasterlist.ts`) — unchanged.
- D1/D2/D3 — note-only.
