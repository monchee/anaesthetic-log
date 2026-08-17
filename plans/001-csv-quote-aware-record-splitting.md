# Plan 001: Make the REDCap CSV parser quote-aware across newlines, and gate `csvUtils.ts` with a coverage floor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 70aa8ac..HEAD -- src/shared/utils/csvUtils.ts src/shared/utils/csvUtils.test.ts vitest.config.ts`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug + tests
- **Planned at**: commit `70aa8ac`, 2026-06-12

## Why this matters

DREAM is a clinical app for anaesthetic allergy workups. Its primary data
ingestion path is `parseRedcapCSV` in `src/shared/utils/csvUtils.ts`, which
parses REDCap CSV exports into patient records. The parser splits the file
into lines **before** doing quote-aware tokenization, so a quoted field
containing a newline (e.g. a clinician pastes a two-line note into REDCap's
"Write a brief summary…" or "Comments" free-text fields) fragments that
patient's row. The tail fragments are then either silently skipped or — worse —
parsed as phantom patient records named "Unknown Unknown" with fabricated
`REC-{i}` IDs and column-shifted clinical data. This has not fired yet (the
department's current 441-row export contains no embedded newlines — verified),
but it is one pasted multi-line comment away, and the failure is silent.
This plan fixes the tokenizer, adds regression tests, and adds a coverage
floor for `csvUtils.ts` so future churn on this file can't quietly drop
test coverage (today only `src/features/testing/**` has an enforced floor).

## Current state

Relevant files:

- `src/shared/utils/csvUtils.ts` — the REDCap CSV parser (709 lines). Contains
  the bug: line-splitting at line 219, per-line cell splitting at lines 73–93.
- `src/shared/utils/csvUtils.test.ts` — 11 existing tests (229 lines). Your
  structural pattern for new tests; none cover embedded newlines.
- `vitest.config.ts` — coverage thresholds currently only cover
  `src/features/testing/**/*.{ts,tsx}`.

The buggy entry point, `csvUtils.ts:218-230` as written:

```ts
export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, data: [], error: "Empty or invalid CSV." };

  // Normalize header tokens once so all downstream matching (exact and
  // substring) is resilient to BOM / NBSP / zero-width / doubled whitespace.
  const headers = splitCSVLine(lines[0]).map(normalizeHeader);

  // Validate headers before processing
  const headerError = validateCSVHeaders(headers);
  if (headerError) {
      return { success: false, data: [], error: headerError };
  }
```

The per-line cell splitter, `csvUtils.ts:73-93` as written (note: quote state
cannot carry across lines because each line is tokenized independently):

```ts
const splitCSVLine = (line: string) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};
```

The row loop that consumes the lines, `csvUtils.ts:498-503`:

```ts
  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length < 2) {
        skippedRows.push(i + 1); // +1 for 1-based row number
        continue;
    }
```

The other call site of `splitCSVLine` is the header parse at line 224 (shown
above). There are no other callers; `splitCSVLine` is not exported.

How fragment rows become phantom patients, `csvUtils.ts:510-514`:

```ts
    const id = getVal('id') || `REC-${i}`;
    const p: Patient = {
        id,
        firstName: getVal('firstName') || 'Unknown',
        lastName: getVal('lastName') || 'Unknown',
```

Repo conventions that apply:

- Plain TypeScript utility modules with exported const arrow functions and
  JSDoc comments — match the style of `normalizeHeader` / `decodeCsvBytes` at
  `csvUtils.ts:24-47`.
- Tests use vitest `describe`/`it` with a small `csv(headers, rows)` builder
  helper — see `src/shared/utils/csvUtils.test.ts:31-36`. Match it.
- 4-space indentation inside `parseRedcapCSV`, 2-space in the helpers near the
  top of the file. Match whatever surrounds your edit.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | exit 0, no output |
| Unit tests (all) | `npx vitest run` | 222+ tests pass (222 at plan time) |
| Unit tests (this file) | `npx vitest run src/shared/utils/csvUtils.test.ts` | all pass |
| Coverage | `npx vitest run --coverage` | exit 0, table printed |
| Lint | `npm run lint` | exit 0 |

(Verified working at plan time. Dependencies are already installed; do NOT run
`npm install`.)

## Scope

**In scope** (the only files you may modify):

- `src/shared/utils/csvUtils.ts`
- `src/shared/utils/csvUtils.test.ts`
- `vitest.config.ts` (thresholds block only)
- `plans/README.md` (status row only)

**Out of scope** (do NOT touch, even though they look related):

- `decodeCsvBytes` and `normalizeHeader` in `csvUtils.ts` — correct as-is,
  shipped in v0.71 with their own tests.
- The three upload handlers that call `decodeCsvBytes`/`parseRedcapCSV` — the
  public signature of `parseRedcapCSV` must not change, so callers need no
  edits.
- `DRUG_TIME_MATCHERS`, `SYMPTOM_CONFIGS`, and all column-mapping config in
  `csvUtils.ts` — clinically curated; do not "clean up" entries (including the
  duplicated `'Glycopyrrolate'` string at line 140 — known, harmless).
- `e2e/` — no E2E changes.
- Coverage thresholds for any path other than the new `csvUtils.ts` entry.
- Real data under `data/` — never read, print, or commit anything from it.

## Git workflow

- Branch: `advisor/001-csv-quote-aware-records` off `main`.
- Commit style: conventional-ish, matching `git log` (e.g.
  `fix(csv): parse quoted fields containing newlines`). One commit per logical
  unit is fine.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a quote-aware record splitter

In `src/shared/utils/csvUtils.ts`, directly below `splitCSVLine`, add a new
function `splitCSVRecords` that tokenizes the **entire file** in a single pass,
carrying quote state across newlines. It must mirror `splitCSVLine`'s existing
character handling exactly (including the `""` escape branch being checked
before the quote-toggle branch), adding only: (a) record breaks on `\n` /
`\r\n` / `\r` when **not** inside quotes, (b) normalization of `\r\n` and `\r`
to `\n` when **inside** quotes, and (c) dropping records whose cells are all
empty (this replaces the old `.filter(l => l.trim())` blank-line behavior).

Target shape:

```ts
/**
 * Splits raw CSV text into records of cells, honoring quoted fields that
 * contain commas, escaped quotes ("") and newlines. Replaces per-line
 * splitting so a multi-line free-text answer cannot fragment a row.
 * Records whose cells are all empty are dropped (blank lines).
 */
const splitCSVRecords = (text: string): string[][] => {
  const records: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;
  const endCell = () => { row.push(current.trim()); current = ''; };
  const endRecord = () => {
    endCell();
    if (row.some(cell => cell !== '')) records.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      endCell();
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      endRecord();
    } else if (char === '\r' && inQuotes) {
      current += '\n';
      if (text[i + 1] === '\n') i++;
    } else {
      current += char;
    }
  }
  endRecord();
  return records;
};
```

**Verify**: `npx tsc --noEmit` → exit 0. (The new function is unused so far;
if your lint config flags unused locals, proceed to Step 2 before running
lint.)

### Step 2: Switch `parseRedcapCSV` to records and delete `splitCSVLine`

1. Replace the top of `parseRedcapCSV` (current lines 218–224):

```ts
export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const records = splitCSVRecords(csvText.replace(/^\uFEFF/, ''));
  if (records.length < 2) return { success: false, data: [], error: "Empty or invalid CSV." };

  // Normalize header tokens once so all downstream matching (exact and
  // substring) is resilient to BOM / NBSP / zero-width / doubled whitespace.
  const headers = records[0].map(normalizeHeader);
```

2. Replace the row loop header (current lines 498–503):

```ts
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    if (row.length < 2) {
        skippedRows.push(i + 1); // +1 for 1-based record number
        continue;
    }
```

Note: `skippedRows` numbers shift from physical-line numbers to record
numbers. That is acceptable — records are what users think of as rows — and
the only consumer is the human-readable `details` string at the bottom of the
function.

3. Delete the now-unused `splitCSVLine` function (lines 73–93). Confirm it has
no other references first:

**Verify**: `grep -rn "splitCSVLine" src/ App.tsx components/` → no matches.
Then `npx tsc --noEmit` → exit 0, and
`npx vitest run src/shared/utils/csvUtils.test.ts` → all 11 existing tests
pass **unchanged**. If any existing test fails, your tokenizer has a behavior
difference from the old one — fix the tokenizer, not the test.

### Step 3: Add regression tests for embedded newlines

In `src/shared/utils/csvUtils.test.ts`, add a new `describe` block
`'parseRedcapCSV — quoted fields containing newlines'`, modeled on the
existing `'parseRedcapCSV — encoding & header robustness'` block
(`csvUtils.test.ts:186-229`) and reusing the existing `csv()` helper and
`baseHeaders`. Cover at minimum:

1. **LF inside a quoted summary**: one row whose "Write a brief summary"
   cell is `'"Line one\nLine two"'` → `result.data` has length 1,
   `result.data[0].history.reactionSummary` is `'Line one\nLine two'`,
   and the patient's `id`/`firstName`/`lastName` parse correctly.
2. **CRLF inside a quoted field** → same expectations; the stored value
   contains `'\n'`, not `'\r\n'`.
3. **No phantom patients**: a 3-row file where the *middle* row has an
   embedded newline in its Comments cell → exactly 3 patients, with the
   correct three `id` values, and **no** patient whose `firstName` is
   `'Unknown'`.
4. **Blank lines between rows are still skipped**: a file with an empty line
   between two data rows → 2 patients, no `details` about skipped rows
   required (blank records are dropped silently, matching old behavior).
5. **Newline in the final cell of the final row** (no trailing newline after
   the closing quote) → row parses, no off-by-one at EOF.

**Verify**: `npx vitest run src/shared/utils/csvUtils.test.ts` → 16 tests
pass (11 existing + 5 new).

### Step 4: Add the coverage floor for `csvUtils.ts`

1. Measure: `npx vitest run --coverage 2>&1 | grep "csvUtils.ts"` → note the
   four percentages (statements, branches, functions, lines) for
   `src/shared/utils/csvUtils.ts` (NOT the `.test.ts` row).
2. In `vitest.config.ts`, inside the existing `thresholds` object (which
   currently contains only the `'src/features/testing/**/*.{ts,tsx}'` entry),
   add a sibling entry, with each value set to the measured percentage
   **rounded down to the nearest whole number**:

```ts
'src/shared/utils/csvUtils.ts': {
  statements: <measured, floored>,
  branches: <measured, floored>,
  functions: <measured, floored>,
  lines: <measured, floored>,
},
```

**Verify**: `npx vitest run --coverage` → exit 0 (thresholds met). Then
sanity-check the gate actually bites: temporarily raise `lines` to `100`, run
again, confirm it **fails**, then restore the floored value and confirm it
passes again.

### Step 5: Full verification pass

**Verify**, in order:

1. `npx tsc --noEmit` → exit 0
2. `npx vitest run` → all tests pass (227 expected: 222 at plan time + 5 new)
3. `npm run lint` → exit 0
4. `git status --porcelain` → only the four in-scope files modified

## Test plan

Covered by Step 3 (five named regression cases) plus the existing 11 tests as
the behavior-parity guard. Structural pattern:
`src/shared/utils/csvUtils.test.ts` — same `csv()` builder, same
`expect(result.data[0]).toMatchObject(...)` assertion style. Verification:
`npx vitest run src/shared/utils/csvUtils.test.ts` → 16 pass.

## Done criteria

ALL must hold:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run` exits 0; the 5 new embedded-newline tests exist and pass
- [ ] `grep -rn "splitCSVLine" src/` returns no matches
- [ ] `grep -n "csvUtils.ts" vitest.config.ts` shows the new thresholds entry
- [ ] `npx vitest run --coverage` exits 0
- [ ] `npm run lint` exits 0
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows changes to `csvUtils.ts` lines 73–93, 218–230, or
  498–514 and the live code no longer matches the "Current state" excerpts.
- Any of the 11 pre-existing `csvUtils.test.ts` tests fails after Step 2 and
  one focused fix attempt — the old tokenizer has a behavior quirk this plan
  didn't anticipate (known quirk to preserve: a lone `""` cell tokenizes to a
  literal `"` character; do not "fix" this).
- `splitCSVLine` turns out to have callers outside `csvUtils.ts`.
- Measured coverage for `csvUtils.ts` in Step 4 is below 60% on any metric —
  the floor would be too weak to be meaningful; report the numbers instead of
  gating.

## Maintenance notes

- Any future column added to the REDCap export only touches the mapping
  config sections; the tokenizer should never need edits for that.
- Reviewer should scrutinize: behavior parity of `splitCSVRecords` vs the old
  `splitCSVLine` (the existing 11 tests are the contract), and that cell
  values now may contain `\n` — downstream renderers display summaries/
  comments as text and handle this fine, but any future CSV *export* feature
  must re-quote such values.
- Deferred (intentionally): the `""` → literal-`"` empty-quoted-cell quirk;
  REDCap exports don't produce bare `""` cells adjacent to real data in
  practice, and silently changing it risks subtle diffs. Fix only with its
  own tests if it ever matters.
- Deferred: per-physical-line numbers in the "skipped rows" message (now
  record numbers — arguably more correct).
