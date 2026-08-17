# Reports page review — Clinical Report, Patient Handout, Powerchart Letter

**Date:** 2026-06-08
**Author:** review by Claude (Opus), for handoff
**Targets:** `src/features/reports/components/{ClinicalReport,PatientHandout,PowerchartLetter}.tsx`
(wired in `App.tsx:142-247`; print CSS in `index.css` `@media print`)
**Status:** review / backlog — implementing is a separate, approved change

---

## Context

The Reports (`SUMMARY`) screen shows three generated documents in tabs and prints
the active one via `window.print()`. The clinic printer is **black & white**, and
these are clinical/patient-facing documents, so each must read correctly on
screen (light + dark) AND produce a clear, unambiguous B&W printout.

Findings were **verified against live print output**: a real saved record on the
v0.56.0 deployment, A4 print PDFs generated for all three documents, then
converted to greyscale (ColorSync Generic Gray profile) to simulate the B&W
printer.

App chrome is correctly `no-print` and only the active tab renders, so print
scope is correct. These three documents were **not** touched by the v0.55.0
testing-plan-document overhaul, so they still carry the same class of issues that
fix resolved.

---

## P1 — Correctness / clinical safety

### P1.1 — Patient Handout prints the WRONG clinic phone number
`PatientHandout.tsx:97` shows `Phone: (02) 9515 8814`. The correct number
everywhere else — `ContactPage.tsx:29` and the text export `reportExporter.ts:161`
— is `(02) 9515 7586`. v0.51.0 fixed the text export but missed the rendered/
printed handout. Wrong contact info on a **patient-facing** document.
**Fix:** `8814 → 7586`.

### P1.2 — B&W: Clinical Report challenge outcome is colour-only
`ClinicalReport.tsx:164-171` renders the challenge result as a green/red
left-border + a `bg-green-600`/`bg-red-600` badge reading "NEGATIVE (Safe)" /
"POSITIVE (Reaction)". In greyscale both badges become the same mid-grey box —
**you cannot tell a tolerated challenge from a reaction by sight**; the text label
is the only surviving cue.
**Fix:** make the outcome survive B&W — e.g. positive = solid black badge,
negative = outlined; keep the explicit word.

### P1.3 — B&W: Patient Handout "AVOID" vs "SAFE" is colour-only
Verified in greyscale: the red "AVOID" badge and green "SAFE" badges render as
nearly identical grey, the section underlines (red/green) go grey, and the row
tints (`red-50`/`green-50`) both go near-white. On a **patient-facing** handout
the dominant avoid/safe coding collapses; only the small badge text remains.
**Fix:** build non-colour asymmetry for print — e.g. AVOID = solid black badge +
thick black left rule on the row; SAFE = outlined badge; enlarge the AVOID label.
(`PatientHandout.tsx:50-88`.)

### P1.4 — No per-page patient identifier on multi-page reports
Confirmed live: the **Powerchart Letter prints to 2 pages**, and page 2 carries
only the referrer email, MDT line, and signature — **no Name/MRN**. Same
separated-page risk fixed for the testing-plan document (v0.55.0). The Clinical
Report and Handout can also exceed one page with a full panel/challenge.
**Fix:** add a print-only running header (Name · MRN · DOB), ideally + footer, on
all three, mirroring `TestingPlanPrintView.tsx` (`print:fixed` header; body print
padding already reserves `20mm` top). Highest stakes on the Letter.

---

## P2 — Cross-cutting consistency (all three docs)

Same fixes applied to the testing-plan document in v0.55.0, not yet here:

- **P2.1 `rounded-lg` → `rounded-none`** — patient banners and section cards
  (`ClinicalReport.tsx:57,81`, `PatientHandout.tsx:37,92,102`,
  `PowerchartLetter.tsx:56,100,131,166,184`) break the app's sharp aesthetic.
- **P2.2 Raw slate → theme tokens (screen)** — `bg-slate-50 dark:bg-card/30`,
  `border-slate-200`, `text-slate-500/700` throughout → `bg-muted` /
  `border-border` / `text-foreground/80`. **Leave `print:` slate utilities** —
  print is always light and they are intentional.
- **P2.3 Heading order** — each doc starts `<h1>` then jumps to `<h3>`, and the
  `SUMMARY` `ScreenLayout` already emits an `<h1>` ("Reports") → two h1s + a
  skipped level. Re-level: document title `h1→h2`, section headings `h3` (keep
  classes), matching the v0.55.0 fix.
- **P2.4 B&W patient name + AVOID text** — patient name is `text-primary` and the
  "AVOID {drug}" line is `text-red-700`; both grey out. Add `print:text-black`
  (`ClinicalReport.tsx:61,207`, `PowerchartLetter.tsx:60,192`,
  `PatientHandout.tsx:40`).
- **P2.5 `print:text-[7px]` timestamp** (all three) is below a readable floor even
  for print — bump to ~`8–9px`.

---

## P3 — Document-specific polish

- **P3.1 Powerchart Letter pagination** — page 2 holds only ~3 trailing lines
  (referrer email, MDT, signature). Tighten trailing spacing / `break-inside` so
  it fits one page where possible (the P1.4 running header makes a stray page 2
  safe regardless).
- **P3.2 Patient Handout `text-[11px]`** on the "Contact Information" heading
  (`:93`) is sub-12px on screen — violates the v0.52.0 rule; use `text-xs`.
- **P3.3 Clinical Report empty-SPT formatting** renders "- mm" with odd spacing
  for blank wheals (`:112`); minor tidy.
- **P3.4 Powerchart Letter is primarily copy-to-eMR** (the "Copy as Text" path);
  its print B&W is lower priority than Handout/Report, but the running header
  (P1.4) and patient-name contrast (P2.4) still apply.

## What already works (leave alone)
- App chrome is `no-print`; only the active tab prints.
- Tables, narrative, and structure are clean and read well.
- Handout dark-mode result-text contrast was fixed in v0.56.0.
- Print signature lines present on Report and Letter.

---

## Recommended first slice
P1.1 (wrong phone — trivial, patient-facing), P1.2 + P1.3 (B&W safe/avoid &
positive/negative legibility), and P1.4 (per-page patient ID). P2.1–P2.5 are a
clean consistency pass mirroring the v0.55.0 testing-plan-doc changes and can ride
along.

## Verification
- `npm run dev`, PIN `2050`, select a patient, Preview & Print Plan → Proceed to
  Testing Panel → enter a positive SPT + a challenge with both outcomes → Save →
  Reports.
- For each tab: Cmd-P print preview set to **Black & white / greyscale** (or
  `sips -s format png x.pdf` then `sips -m '…/Generic Gray Profile.icc'`): confirm
  AVOID≠SAFE and challenge POSITIVE≠NEGATIVE are distinguishable without colour,
  and patient name + AVOID render solid black.
- Force a 2-page Letter; confirm Name/MRN running header on every page.
- Light + dark on screen: no `rounded-lg`, no stray light-slate in dark.
- `npm run lint` + `npm run build` clean; extend axe coverage on the Reports tabs.

## Out of scope
- Clinical wording / recommendation logic (`testingUtils.ts`, `reportExporter.ts`
  text) — unchanged; this is presentation/print only.
- The testing-plan document (`TestingPlanPrintView.tsx`) — already done (v0.55.0).
