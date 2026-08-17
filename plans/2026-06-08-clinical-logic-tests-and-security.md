# Clinical-logic tests + cross-sensitization extraction + security pass

**Date:** 2026-06-08
**Author:** plan by Claude (Opus), for handoff
**Scope:** P1 (test the untested clinical record logic + remove a duplicated rule) and P2 (CSP + npm audit)
**Status:** ready to implement — no clinical behaviour changes

---

## Context

After the UI/print/UX run (v0.54–v0.58), the biggest remaining risk is that the
code translating data into/out of the medical record is untested, and the app
ships without a Content-Security-Policy. This plan closes both: unit-test the
clinical output/import logic, remove a fragile duplicated rule, add a CSP, and
clear the npm audit vulnerabilities. Tests pin existing behaviour; the extraction
is behaviour-preserving.

Grounding: `testingUtils.ts` grading + cross-sensitization **notes** are already
well covered by `testingUtils.test.ts` (`isSkinTestPositive`, `get*Results`,
`getCrossSensitizationNotes`, `buildRecommendations`). The gaps are
`reportExporter.ts`, `csvUtils.ts`, and the cross-sensitized **drug-list**
derivation that lives inline in the report components.

---

## Part A — P1: clinical-logic tests + extraction

### A1. Extract the cross-sensitized drug-list rule (behaviour-preserving)
All three report components re-derive the cross-sensitized drugs by string-matching
the note text — fragile and duplicated:
`crossNotes.map(n => n.includes('Vecuronium') && !posResults.includes('Vecuronium') ? 'Vecuronium' : 'Rocuronium')`
(`ClinicalReport.tsx:20-22`, `PatientHandout.tsx:19-21`, `PowerchartLetter.tsx:29-31`).

- Add to `src/shared/utils/testingUtils.ts` a
  `getCrossSensitizedDrugs(positives: string[]): string[]` that returns the drug
  names directly, mirroring the existing `getCrossSensitizationNotes` logic
  (Roc→Vec and Vec→Roc when only one is positive). Reuse `MUSCLE_RELAXANTS`.
- Replace the inline `.map(...)` in the three components with
  `const crossSensitized = getCrossSensitizedDrugs(posResults);`.
- Add tests to `testingUtils.test.ts`: Roc-only → `['Vecuronium']`, Vec-only →
  `['Rocuronium']`, both → `[]`, neither → `[]`.

### A2. `src/shared/utils/reportExporter.test.ts` (new — eMR/handout text)
Cover all exports (`reportExporter.ts:6-203`): `formatTryptaseSentence`,
`formatClinicalReportAsText`, `formatPatientHandoutAsText`,
`calculateMinutesAfterInduction`, `formatSymptomsList`, `formatTreatmentList`,
`getOutcomeText`, `generateLetterText`. Key cases:
- tryptase **obtained vs not-obtained** sentence (the "always one of three
  standardised sentences" rule from v0.51).
- a letter with positives + negatives + challenge; cross-sensitization sentence
  present when Roc-only positive.
- the `redact` callback path (identifiers masked).
- `generateLetterText` with `patient = null` (manual entry) — no narrative crash.
- corrected handout contact block (phone `(02) 9515 7586`).
- empty/edge inputs.
Reuse `src/test/factories/{testingDataFactory,patientFactory}`.

### A3. `src/shared/utils/csvUtils.test.ts` (new — REDCap import)
Target `parseRedcapCSV` (`csvUtils.ts:191`) through the public API. Cases:
- valid labelled REDCap export → correct `Patient[]`.
- missing required column (`Record ID` / `First Name` / `Last Name` /
  `Date of Reaction:`) → `success:false` with the helpful "export using CSV /
  Microsoft Excel (labels)" message.
- quoted fields containing commas and escaped `""` (exercises `splitCSVLine`).
- `(choice=…)` drug-column parsing.
- HH:MM and HHMM time parsing.
- empty file and header-only file → graceful `success:false`, never throws.

**Clinician review (flag, do not block):** these tests pin *current* behaviour.
Surface for sign-off: the `≥3 mm` positivity threshold (`isSkinTestPositive`),
the Roc/Vec cross-sensitization assumption, and the tryptase/letter wording.

## Part B — P2: security

### B1. Content-Security-Policy (`public/_headers`)
Add under the existing `/*` block (already has `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
Cloudflare Pages `_headers` is static (no env interpolation), so allowlist the
services the app actually calls:
- `default-src 'self'`
- `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io`
  (Supabase REST + realtime `wss` — `src/lib/supabase.ts`; Sentry — `src/lib/sentry.ts`)
- `script-src 'self'` (Vite module scripts + PWA `registerSW`; verify no inline `<script>` in `index.html`)
- `style-src 'self' 'unsafe-inline'` (inline `style={{…}}` attributes used across components)
- `img-src 'self' data:` · `font-src 'self'` · `base-uri 'self'` · `form-action 'self'`
- `frame-ancestors 'none'` · `object-src 'none'`

**Roll out safely:** ship first as `Content-Security-Policy-Report-Only`, verify
zero violations across every flow in preview, then flip to enforcing
`Content-Security-Policy`. (Note: `index.html`/`vite.config.ts` currently have
uncommitted edits — reconcile before finalising the script-src decision.)

### B2. `npm audit fix`
3 vulnerabilities (1 high `ws`, 2 moderate, transitive). Run plain `npm audit fix`
(NOT `--force`); confirm `package-lock.json` changes are minor; re-run lint + unit
+ build. If only `--force` resolves them, stop and report rather than risk a
breaking major bump.

## Files
- `src/shared/utils/testingUtils.ts` (+`getCrossSensitizedDrugs`), `testingUtils.test.ts` (+cases)
- `src/features/reports/components/{ClinicalReport,PatientHandout,PowerchartLetter}.tsx` (use helper)
- `src/shared/utils/reportExporter.test.ts` (new), `src/shared/utils/csvUtils.test.ts` (new)
- `public/_headers` (CSP), `package-lock.json` (audit fix)

## Verification
1. `npm run test:unit` — new suites pass; existing tests stay green.
2. `npx tsc --noEmit` + `npm run lint` clean.
3. Cross-sensitization: Rocuronium positive only → all three reports still list
   Vecuronium under avoid/cross-sensitized (output unchanged).
4. CSP: `npm run preview`, exercise PIN unlock, CSV upload, a save, Reports, and a
   Research DB submit; confirm no CSP violations in console (report-only first),
   then enforce and re-verify.
5. `npm audit` → 0 (or only unfixable-without-force, reported).
6. `npm run build` succeeds.

## Out of scope
- Changing any clinical threshold, letter wording, or grading rule (tests pin
  current behaviour; changes need clinician sign-off first).
- P3 resilience, P4 in-flight PWA/CI work, P5 performance — separate efforts.

## Suggested release
One version bump (e.g. v0.59.0) once CSP is verified enforcing; or ship A (tests +
extraction) + B2 (audit) immediately, with B1 CSP report-only first then a fast
follow to enforce.
