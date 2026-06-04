# Plan: DREAM App Feedback — June 2026 Clinic

## Context

After two monthly allergy clinics, the team (Dr. Dave Zalcberg and CNCs Karen & Zoe) sent consolidated feedback (May 5 and June 3, 2026). Many items were already shipped in v0.48.0–v0.49.0. This plan covers only what is **still outstanding**.

---

## What's Already Done (no action needed)

| Feedback | Shipped |
|---|---|
| Parecoxib IDT 1:100 only | v0.48.0 |
| Propofol: SPT Neat + IDT 1:1000 + IDT 1:10 only | v0.48.0 |
| Sugammadex Alone + +Rocuronium selectable simultaneously | v0.48.0 |
| Print header/footer suppressed | v0.48.0 |
| "-" instead of 0 in empty result fields | v0.48.0 |
| Drug persistence: testing plan → testing page | v0.48.0 |
| Rocuronium ↔ Vecuronium cross-sensitization | v0.49.0 |
| AVOID [DRUG] + allergy bullets + MedicAlert for muscle relaxants | v0.49.0 |
| Nursing notes section (clinical report only) | v0.49.0 |
| IV challenge block in eMR letter | v0.49.0 |
| 6-hour report retention (localStorage TTL, restored on mount) | v0.49.0 |
| REDCap testing-plan instrument parity (partial — see Issue 5) | v0.49.0 |
| Contact page phone updated to (02) 9515 7586 | v0.48.0 |

**Dave #3a (email opens Gmail):** This is a browser/OS default mail-handler setting, not an app bug. DREAM already uses `window.location.href = 'mailto:...'` which delegates to the OS. No code change needed — the team should set their default mail client to Mail.app or Outlook in browser settings.

---

## Remaining Issues

### 1. Tryptase line missing from eMR letter (HIGH — mentioned twice)

**Root cause confirmed:** `INITIAL_FORM_STATE` in `src/features/testing/hooks/useTestingState.ts` has no `tryptase` key. When the user never toggles the switch, `data.tryptase` is `undefined`. `PowerchartLetter.tsx:111` does `{data.tryptase && ...}` — nothing renders.

**Fix:** In `PowerchartLetter.tsx` and `generateLetterText()`, replace the conditional check with an unconditional render that falls back to `{obtained: false, significantElevation: false, values: []}`:

```tsx
// PowerchartLetter.tsx — always render tryptase sentence (remove the conditional)
const tryptaseSentence = formatTryptaseSentence(
  data.tryptase ?? { obtained: false, significantElevation: false, values: [] }
);
// render: <p className="italic text-foreground/80">{tryptaseSentence}</p>  (always, not conditional)
```

Same change in `generateLetterText()` (`reportExporter.ts` lines 229–232):
```typescript
lines.push(formatTryptaseSentence(
  data.tryptase ?? { obtained: false, significantElevation: false, values: [] }
));
lines.push('');
```

This ensures one of Dave's three required sentences always appears:
1. "Serial serum tryptase samples were not obtained." (default when not entered)
2. "Serial serum tryptase samples revealed clinically significant dynamic tryptase elevation …"
3. "Serial serum tryptase samples were obtained and were not elevated …"

---

### 2. Unusual characters after drug name in copied text (HIGH — June 3)

**Root cause:** `generateLetterText()` uses em dashes (`—`) throughout. When pasted into PowerChart (a legacy HL7 system), `—` renders as `â€"` or similar garbled sequences.

**Fix:** Replace **all** em dashes in `generateLetterText()` with ASCII-safe alternatives:

| Location | Current | Fix |
|---|---|---|
| `reportExporter.ts:241` | `${drug.toUpperCase()} — POSITIVE` | `${drug.toUpperCase()}: Positive` |
| `reportExporter.ts:244` | `${drug} — Negative` | `${drug}: Negative` |
| `reportExporter.ts:258` | `Drug challenge with ${cName} — tolerated.` | `Drug challenge with ${cName}: tolerated.` |
| `reportExporter.ts:262` | `Drug challenge with ${cName} — reaction at ...` | `Drug challenge with ${cName} - reaction at ...` |

The HTML display in `PowerchartLetter.tsx` can keep em dashes (they render fine in the browser), as those are never pasted into PowerChart — only the text from `generateLetterText()` is.

---

### 3. Referrer email not displayed in report (HIGH — June 3)

**Request:** "Can Dream copy the email address of the referrer and the patient (if it's there) and put it at the bottom of the report."

**Current state:** `patient.history.referringEmail` is already parsed from REDCap CSV column `"Email Address:"` (`csvUtils.ts:224, 500`) but never rendered in any report output. Patient email has no field in the schema — Dave said "if it's there," so skip patient email for now.

**Fix — `PowerchartLetter.tsx`:** Add before the MDT signature block:
```tsx
{patient?.history?.referringEmail && (
  <p className="text-sm print:text-xs text-foreground/80">
    <span className="font-semibold">Referrer email: </span>
    {patient.history.referringEmail}
  </p>
)}
```

**Fix — `generateLetterText()` (`reportExporter.ts`):** Add before the MDT signature line:
```typescript
if (patient?.history?.referringEmail) {
  lines.push(`Referrer email: ${patient.history.referringEmail}`);
}
```

---

### 4. Phone number wrong in Patient Handout text export (LOW)

`reportExporter.ts:161` was missed when v0.48.0 updated the contact page:

```diff
- lines.push('Phone: (02) 9515 8814');
+ lines.push('Phone: (02) 9515 7586');
```

---

### 5. REDCap testing plan drug mismatch — name string bug (MEDIUM)

**Reported:** Patient #140 had Muscle Relaxant panel + Cefazolin in REDCap but they went missing in DREAM. DREAM also added Propofol unexpectedly.

**Actual root cause (confirmed):** The values in `TESTING_PLAN_DRUG_MAPPING` (`csvUtils.ts:385–418`) must exactly match the `drugName` strings in `DRUG_MASTERLIST`. When they don't, the testing plan row is created with a mismatched name — the protocol/IDT steps can't be found, and the drug "comes across differently."

Confirmed offender:
- `'Cis-atracurium': ['Cisatracurium']` — emits `Cisatracurium` (no hyphen) but the masterlist name is `Cis-atracurium` (`drugMasterlist.ts:10`)

**Fix:** Correct the mismatch and add missing drugs:

```typescript
// csvUtils.ts — TESTING_PLAN_DRUG_MAPPING
'Cis-atracurium':  ['Cis-atracurium'],   // was ['Cisatracurium'] — add the hyphen

// Add missing entries:
'Sugammadex':      ['Sugammadex (Alone)', 'Sugammadex (+ Rocuronium)'],
'Parecoxib':       ['Parecoxib'],
```

**Also required before shipping:** Audit all ~30 mapping values against `DRUG_MASTERLIST` to catch any other name mismatches.

**Separate investigation:** The "Propofol added unexpectedly" symptom needs a real REDCap CSV export with the specific patient data to reproduce and diagnose. The `testingPlanStartIdx` `findIndex` collision theory is likely NOT the root cause — the reaction-drug section explicitly filters `Muscle Relaxant (...)` headers (`csvUtils.ts:294`), making the testing-plan landmark genuinely unique.

---

## Files to Change

| File | Change |
|---|---|
| `src/features/reports/components/PowerchartLetter.tsx` | Always render tryptase sentence (remove conditional, use fallback); add referrer email before MDT signature |
| `src/shared/utils/reportExporter.ts` | Tryptase fallback in `generateLetterText()`; fix 4 em dash locations (lines 241, 244, 258, 262); fix phone number (line 161); add referrer email before MDT signature line |
| `src/shared/utils/csvUtils.ts` | Fix `Cis-atracurium` name mismatch; add Sugammadex + Parecoxib to `TESTING_PLAN_DRUG_MAPPING`; audit all mapping values against masterlist |

---

## Verification

1. Submit a testing session without touching the tryptase toggle → eMR letter shows "Serial serum tryptase samples were not obtained."
2. Copy eMR letter text → paste into TextEdit or Notepad → no garbled characters around drug names, results, or challenge sentences
3. Load a REDCap-imported patient with a referrer email → eMR letter shows the email address before the MDT signature
4. Open Patient Handout text export → footer shows `Phone: (02) 9515 7586`
5. Import a REDCap CSV with Cis-atracurium + Sugammadex checked in the testing plan → both auto-select with correct IDT protocols in DREAM
