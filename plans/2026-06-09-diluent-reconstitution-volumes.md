# Plan: Add reconstitution volumes to per-drug diluent (testing request/print)

## Context

The drug-library docs (`/Users/monchee/Projects/scratch/docs/drugs/*.md`) state a
**specific reconstitution volume** for powder/concentrate drugs (e.g. Cefazolin
"10 mL WFI", Ceftazidime "20 mL WFI", Tazocin "20 mL NS"). Our `diluent` field
currently records only the *type* ("0.9% sodium chloride (reconstitute with WFI)").
Doctors want the actual amount on the request so nurses can prepare the stock vial
without cross-referencing.

Decision (user): **reconstitution volume only.** The per-step IDT dilution volume
(almost always "0.1 mL drug + 0.9 mL NS", already implied by the printed IDT
ratios) is NOT added — generic and would clutter every row. SPT-dilution volumes
(insulin/metacresol/etc.) are also out of scope (and the insulin "19 mL" figure is
a suspected doc error — see caveats).

**This is a data-only change.** The print view + mobile card already render the
`diluent` string in the stacked SPT-Preparation sub-line (v0.63.0), so amounts
flow through automatically — no component/schema changes.

> ⚠️ Clinical-safety: these volumes feed a clinical document. The whole diluent
> dataset already carries a "needs clinician sign-off" note; this extends it.
> Flag the residual-uncertainty items (below) for clinician confirmation.

Source of truth: subagent mining of `/Users/monchee/Projects/scratch/docs/drugs/*.md`
cross-referenced to `DRUG_MASTERLIST`. Reconcile each value against the actual
`drugName` in the masterlist before applying — do not invent entries.

---

## Change — update `diluent` strings in `src/shared/data/drugMasterlist.ts`

Match by `drugName`; update only `skin`/`control`/`experimental` entries.
Keep the existing wording style ("0.9% sodium chloride", "reconstitute with …");
just insert the volume. Target values:

**WFI reconstitution** → `0.9% sodium chloride (reconstitute with <N> mL WFI)`:
- Vecuronium 2.5 mL · Cefazolin 10 mL · Cefepime 10 mL · Cefotaxime 10 mL ·
  Ceftazidime 20 mL · Ceftriaxone 10 mL · Augmentin 50 mL · Ampicillin 5 mL ·
  Amoxycillin 5 mL · Azithromycin 4.8 mL · Remifentanil 20 mL

**WFI-or-saline reconstitution** → `0.9% sodium chloride (reconstitute with <N> mL WFI or saline)`:
- Thiopental 20 mL · Doxycycline 10 mL · Hydrocortisone 2 mL

**Saline reconstitution** (currently plain `0.9% sodium chloride` — these are
powders) → `0.9% sodium chloride (reconstitute with <N> mL)`:
- Tazocin 20 mL · Pantoprazole 10 mL · Methylprednisolone 5 mL · Parecoxib 5 mL ·
  Cefuroxime 30 mL · Benzylpenicillin 1.6 mL
- Vancomycin → `0.9% sodium chloride (reconstitute with 5 mL [500 mg] / 10 mL [1 g])`

**Oral tablet/capsule dissolution** → `0.9% sodium chloride (dissolve in 1 mL)`:
- Esomeprazole · Lansoprazole · Omeprazole · Rabeprazole

**Special phrasings:**
- Mepivacaine → `0.9% sodium chloride (dilute 3% stock with 4.4 mL WFI)`
  (it's a concentration step, not a powder reconstitution).
- Penicillin Major / Penicillin Minor → keep PBS, add supplied volume:
  `Phosphate-buffered saline (1 mL supplied diluent — not plain saline)`.

**Leave unchanged** (ready-to-use, no reconstitution): all currently-plain
`0.9% sodium chloride` RTU drugs (Rocuronium, Cis-atracurium, Propofol, opioids,
contrasts, etc.), Latex (`Neat — no diluent`), and the 5 blank-diluent unmatched
drugs.

**Residual uncertainty — flag for clinician, do NOT guess a volume:**
- Cephalexin, Levofloxacin — pharmacy-prepared stock; no fixed bedside volume →
  leave as-is.
- Levonorgestrel — "1–2 drops" only; too imprecise → leave as-is.
- Insulins (Actrapid/Novorapid/Humulin NPH/Humulin R/Optisulin/Protaphane) —
  doc's "19 mL" SPT figure conflicts with the 1.9 mL IDT step (suspected error);
  they're RTU anyway (no reconstitution) → leave diluent as-is.

---

## Tests & verification

- Update `src/shared/data/drugMasterlist.test.ts`: adjust the existing diluent
  assertions (e.g. Cefazolin now `…(reconstitute with 10 mL WFI)`); add one
  asserting an RTU drug (Rocuronium) stays `0.9% sodium chloride` (no volume).
- `npx tsc --noEmit`, `npm run lint`, `npm run test:unit` (expect 182 to stay
  green after the assertion updates), `npm run build` — all clean.
- Check `src/shared/utils/testingPlanFormatter.ts` — if it doesn't already emit
  `diluent`, no change needed (out of scope); just confirm nothing else hard-codes
  the old strings.
- Manual (`/browse`): print-preview a multi-drug request — confirm reconstitution
  volumes show in the stacked sub-line (e.g. "in 0.9% sodium chloride
  (reconstitute with 10 mL WFI)") and the table still fits the page width.
- Version bump (0.64.0) + CHANGELOG entry, repeating the clinician-sign-off note
  and listing the residual-uncertainty items.
