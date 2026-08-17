# Plan: Testing Request form — remove challenge protocols, add diluent column, surface REDCap "Others"

## Context

Three doctor-requested changes to the **Testing Request form / printed request**:

1. **Remove the "Challenge / Desensitisation Protocols" section** from the printed
   request. The clinic no longer wants the graded challenge/desensitisation step
   tables on the request document.

2. **Add a per-drug "Diluent" column** to the skin-test table so nurses can pick
   it up at a glance. (Neat concentration is *already* shown — the "SPT
   Preparation" column renders `sptNeatConcentration`. Diluent is the genuinely
   missing field; it is not stored anywhere today.) User chose a **per-drug
   column** over a single standard note.

3. **Surface the REDCap "Others (not listed)" free-text field.** It is parsed on
   import into `patient.history.testingPlanCustom` but never read by the builder,
   so it silently vanishes. User chose: **read-only callout + one-click "Add as
   custom item"**.

> ⚠️ **Clinical-safety note (Part 2):** diluent values are **sourced per-drug**
> from the drug-reference docs at `/Users/monchee/Projects/scratch/docs/drugs/`
> (one markdown file per drug), mined via subagent. They are NOT blanket defaults.
> The clinician should still sign off before release. Flag in the CHANGELOG that
> the dataset was derived from the scratch drug-library and list the residual
> "confirm" items (Levofloxacin tablet prep; the 5 unmatched drugs).

---

## Part 1 — Remove Challenge / Desensitisation Protocols (print only)

Section exists **only** in the printed request; the interactive builder never
renders it. **Leave the protocol data in `drugMasterlist.ts` untouched.**

**File: `src/features/testing/components/TestingPlanPrintView.tsx`**
- Delete the "Challenge Protocols section" IIFE — **lines 318–393**
  (`{/* Challenge Protocols section */}` through its closing `})()}`).
- Remove `getProtocolsForDrug` from the import on **line 7** (keep
  `getSkinProtocolsForDrug`).
- Drop `FlaskConical` from the lucide import if it was only used by the removed
  heading (verify no other use first).

**Do NOT touch:** `drugMasterlist.ts` challenge entries / `ChallengeStep` /
`getChallengeDrugsByCategory`; the separate live-challenge feature
(`ChallengeSection.tsx` / `proceedToChallenge` / `includeInChallenge`).

---

## Part 2 — Add per-drug "Diluent" column to the skin-test table

**File: `src/features/testing/types.ts`**
- Add `diluent: string;` to the `DrugProtocol` interface (after
  `sptNeatConcentration`, line 18).

**File: `src/shared/data/drugMasterlist.ts`**
- Add `diluent` to **every** `DrugProtocol` entry (required field → all must set
  it). `testType: 'challenge'` entries → `diluent: ''` (N/A — oral/IV graded
  challenge; section removed anyway).
- For `skin`/`control`/`experimental` entries, apply the **sourced values below**
  (decision: show *both* reconstitution + dilution steps where they differ).
- Add an in-code comment noting the dataset was mined from the scratch
  drug-library docs and listing the "confirm" items.

**Diluent values by group** (apply to the matching skin/control/experimental entries):

`'0.9% sodium chloride'` — ready-to-use / saline throughout:
Cis-atracurium, Rocuronium, Pancuronium, Suxamethonium, Sugammadex (Alone),
Sugammadex (+ Rocuronium), Benzylpenicillin, Cephalexin, Tazocin, Cefuroxime,
Midazolam, Propofol, Ketamine, Lignocaine, Bupivacaine, Ropivacaine, Alfentanil,
Fentanyl, Morphine, Oxycodone, Chlorhexidine, Povidone Iodine, Esomeprazole,
Lansoprazole, Omeprazole, Pantoprazole, Rabeprazole, Actrapid, Betamethasone,
Ciprofloxacin, Clindamycin, Dalteparin, Dexamethasone, Droperidol, Enoxaparin,
Fluconazole, Glycopyrronium, Granisetron, Heparin, Humulin NPH, Humulin R,
Levonorgestrel, Medroxyprogesterone, Metacresol, Methylprednisolone,
Metoclopramide, Metronidazole, Neostigmine, Novorapid, Omnipaque, Ondansetron,
Optisulin, Paracetamol, Parecoxib, Patent Blue, Protamine, Protaphane,
Tranexamic Acid, Tramadol, Triamcinolone, Ultravist, Urografin, Vancomycin,
Visipaque, Xylocaine.

`'0.9% sodium chloride (reconstitute with WFI)'` — powder/concentrate needs WFI first:
Vecuronium, Ampicillin, Amoxycillin, Augmentin, Cefazolin, Cefepime, Cefotaxime,
Ceftazidime, Ceftriaxone, Azithromycin, Remifentanil, Mepivacaine.

`'0.9% sodium chloride (WFI or saline to reconstitute)'` — flexible reconstitution:
Thiopental, Doxycycline, Hydrocortisone.

`'Phosphate-buffered saline (supplied — not plain saline)'` — manufacturer diluent:
Penicillin Major, Penicillin Minor.

`'Neat — no diluent'` — commercial extract used neat:
Latex.

`'0.9% sodium chloride (tablet prep — confirm with pharmacist)'`:
Levofloxacin (doc flags tablet form needs pharmacist confirmation).

`''` (blank → renders "—") + **flag for clinician to fill** — no source doc found:
Methoxybenzylpenicillin, Cefuroxime Suspension, Methylene Blue, IV Contrast, Atropine.

> Source of truth for the above: subagent mining of
> `/Users/monchee/Projects/scratch/docs/drugs/*.md`. If a masterlist drug name
> here doesn't exactly match an existing entry, reconcile against the actual
> `DRUG_MASTERLIST` `drugName` values before applying — do not invent entries.
> The IDT *dilution* diluent is 0.9% sodium chloride for essentially all drugs;
> the parenthetical notes capture the *reconstitution* step where it differs.

**File: `src/features/testing/components/TestingPlanPrintView.tsx`**
- Desktop/print table (header line 233–242): insert a **"Diluent"** `<th scope="col">`
  after "SPT Preparation" (line 238); adjust column widths (e.g. Drug/Presentation/
  SPT Prep/Diluent share the left side, SPT Result stays `w-[70px]`, IDT takes the
  remainder).
- Desktop table body (line 248–279): add a `<td>` after the SPT Preparation cell
  (line 257) rendering `protocol?.diluent || '—'`.
- Mobile card list (line 205–214): add a "Diluent:" line alongside "SPT prep:"
  using `protocol?.diluent`.
- Custom drugs (Additional section, lines 287–311) are clinician-entered and
  out of scope — leave unchanged.

---

## Part 3 — Surface "Others (not listed)" with read-only callout + 1-click add

Data already at `patient.history.testingPlanCustom`
(`src/features/patients/types.ts:41`; parsed in `csvUtils.ts:425-427,642-643`).
Builder UI only — no data-model/import changes.

**File: `src/features/testing/components/TestingPlanGenerator.tsx`**
1. Add a handler that adds the imported text as a custom drug, reusing the
   `addCustomDrug` pattern (lines 176–202): build a `CustomDrugEntry`
   (`{ name, sptConcentration: '', idtSteps: [], includeInChallenge: false }`),
   push to `customDrugs`, add `name` to `selectedDrugs`; guard against double-add
   via the existing `normalizeDrugName` dedupe.
2. Render a **read-only callout** in the "Additional Items" block (above the
   custom-drug list, near lines 511–519), shown only when
   `patient.history.testingPlanCustom` is non-empty AND not already added.
   Content: label "From REDCap — Others (not listed)", the raw text (read-only),
   and an "Add as custom item" button wired to the handler. Match surrounding
   styling (`bg-muted` / dashed border, `rounded-none`). Builder-only; not part
   of the printed output itself.
3. After adding, the entry flows through the existing custom-drug pipeline into
   the printed request automatically; the callout disappears (per the guard).

No draft-persistence shape change — the entry is a normal custom drug, already
covered by the autosave effect (lines 124–140).

---

## Verification

- `npx tsc --noEmit` clean (the new required `diluent` field forces every
  masterlist entry to be updated — tsc will catch any missed entry); `npm run lint` clean.
- `npm run test:unit` — existing 175 pass. Add tests:
  - `TestingPlanGenerator.test.tsx`: patient with `history.testingPlanCustom` →
    callout shows; click "Add as custom item" → appears as selected custom drug,
    callout disappears.
  - Optional: a drugMasterlist test asserting a plain-saline drug (e.g. Rocuronium)
    reads `0.9% sodium chloride` and a WFI drug (e.g. Cefazolin) reads
    `0.9% sodium chloride (reconstitute with WFI)`.
- `npm run build` clean.
- Manual (`/browse` on dev server):
  - Builder → print preview: **Challenge/Desensitisation section gone**; skin-test
    table now shows a **Diluent** column; rest intact (sign-off, running
    header/footer, IDT ladder).
  - Patient with REDCap "Others (not listed)" text → callout shows; "Add as
    custom item" creates a testable row that prints.
- Version bump + CHANGELOG entry (include the diluent clinician-verification flag
  and the residual "confirm" items).
