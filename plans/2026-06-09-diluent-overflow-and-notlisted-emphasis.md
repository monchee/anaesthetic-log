# Plan: Testing Request — fix diluent column overflow + REDCap "(not listed)" emphasis

## Context

Follow-up to v0.62.0 (already shipped: challenge section removed, per-drug diluent
added, REDCap "Others (not listed)" callout). Three things now:

1. **Diluent column overflows the request table, worst on print preview.** Adding a
   6th column (Diluent) made the skin-test table too wide. **Fix: merge "SPT
   Preparation" and "Diluent" into one stacked column** (decision: neat
   concentration on top, a smaller muted `in <diluent>` line beneath). This drops
   back to 5 columns and frees the width.

2. **Capture the just-made amber-emphasis change** (already on disk, uncommitted):
   when a REDCap "(not listed)" item is *pending* (imported, not yet added), the
   builder's "Additional Items" section, header, and callout turn amber. This plan
   records it so it ships with this batch.

3. **Two opted-in follow-ups** so the "(not listed)" signal persists after adding
   and reaches paper:
   - **Persist provenance** — colour the added item in the builder once it's been
     added from a REDCap "(not listed)" request.
   - **Print-safe signifier** — mark it on the printed request (B&W printer → a
     bordered tag, NOT colour-only).

---

## Part 1 — Merge SPT Preparation + Diluent (fix overflow)

**File: `src/features/testing/components/TestingPlanPrintView.tsx`**

Desktop/print table (header ~line 238–245, body ~line 252–283):
- **Remove** the standalone `Diluent` `<th>` (line 242) and its `<td>` (line 262).
- Keep the "SPT Preparation" header; widen it to absorb the freed space and
  **restore widths so the table fits print** — e.g. Drug `w-[20%]`, Presentation
  `w-[18%]`, SPT Preparation `w-[26%]`, SPT Result `w-[70px]`, IDT remainder.
- In the SPT Preparation `<td>`, render **stacked**:
  - line 1: `{protocol?.sptNeatConcentration || '—'}`
  - line 2 (only when `protocol?.diluent`): a smaller muted line
    `in {protocol.diluent}` (e.g. `text-[10px] print:text-[8px] text-muted-foreground/80`).
  - **Edge case:** if `diluent` starts with `Neat` (the Latex "Neat — no diluent"
    sentinel), render the value alone without the `in ` prefix. Blank diluent →
    omit the sub-line entirely (the 5 unmatched drugs + challenge entries).

Mobile card list (~line 205–217): apply the same merge — drop the separate
"Diluent:" grid cell; show the `in <diluent>` sub-line beneath the "SPT prep:"
value so mobile matches print.

---

## Part 2 — Amber emphasis for a *pending* "(not listed)" item (already done)

**File: `src/features/testing/components/TestingPlanGenerator.tsx`** — already on disk:
- `hasPendingRedcapOther = Boolean(redcapOtherText) && !redcapOtherAlreadyAdded`.
- When true: Additional Items section gets amber bg + ring, header text amber with
  a pulsing amber dot, and the callout uses amber border/bg/label + amber-accented
  button. Reverts to the normal `customTheme` style once added.

No further change needed; included here for the batch + changelog.

---

## Part 3 — Persist provenance after adding (follow-up 1)

**File: `src/features/testing/types.ts`**
- Add `fromRedcapOther?: boolean;` to the `CustomDrugEntry` interface (line 24–29).

**File: `src/features/testing/components/TestingPlanGenerator.tsx`**
- In `addRedcapOtherAsCustomDrug` (and/or `addCustomDrugByName` when the name came
  from the REDCap callout), set `fromRedcapOther: true` on the created entry.
  Keep the existing dedupe; don't set the flag for manually-typed customs.
- In the custom-drug chip list (~line 561+), when `entry.fromRedcapOther`, give the
  chip an amber accent (border/text) so the item stays visually marked as the
  REDCap "(not listed)" request even after it's added. Pair the colour with a
  small "(not listed)" text label so it's not colour-only.
- Draft persistence already serializes `customDrugs` wholesale, so the flag
  survives autosave/restore with no extra work.

---

## Part 4 — Print-safe "(not listed)" signifier (follow-up 2)

**File: `src/features/testing/components/TestingPlanPrintView.tsx`** — "Additional"
section (~line 291–315):
- When `entry.fromRedcapOther`, append a **print-safe bordered tag** beside the
  name, e.g. `<span class="border border-foreground print:border-black rounded-none
  px-1 text-[9px] uppercase">not listed</span>` — mirrors the existing tryptase
  "Peak" tag pattern (B&W-safe: border + text, never colour-only).
- No colour reliance on print (clinic printer is B&W).

---

## Verification

- `npx tsc --noEmit` clean; `npm run lint` clean.
- `npm run test:unit` — current 181 pass. Extend `TestingPlanGenerator.test.tsx`:
  after "Add as custom item", assert the added chip carries the "(not listed)"
  marker; and that a non-REDCap custom drug does not. Extend
  `TestingPlanPrintView.test.tsx`: a `customDrugs` entry with
  `fromRedcapOther: true` renders the print-safe "not listed" tag; merged SPT
  Preparation cell shows the `in <diluent>` sub-line and no separate Diluent column.
- `npm run build` clean.
- Manual (`/browse` on dev server):
  - **Print preview** of a request with several skin-test drugs — confirm the
    table no longer overflows the page width, and each row shows neat conc with the
    diluent stacked beneath.
  - Patient with REDCap "(not listed)" text — pending callout/section is amber;
    after "Add as custom item" the chip stays marked; print shows the bordered
    "not listed" tag in the Additional section.
- Version bump (0.63.0) + CHANGELOG entry.
